const fs = require('fs')
const path = require('path')
const { extname } = require('path')
const config = require('config')
const { Umzug } = require('umzug')
const sortBy = require('lodash/sortBy')
const isFunction = require('lodash/isFunction')

const logger = require('../logger')
const db = require('./db')

const v4BaseMessage = 'Starting with coko server v4,'

const resolveRelative = m => require.resolve(m, { paths: [process.cwd()] })

const tryRequireRelative = componentPath => {
  try {
    /* eslint-disable-next-line import/no-dynamic-require, global-require */
    const component = require(require.resolve(componentPath, {
      paths: [process.cwd()],
    }))

    return component
  } catch (e) {
    throw new Error(
      `Unable to load component ${componentPath} on the server. ${e}`,
    )
  }
}

// componentPath could be a path or the name of a node module
const getMigrationPaths = () => {
  const migrationPaths = []

  const getPathsRecursively = componentPath => {
    const component = tryRequireRelative(componentPath)

    const migrationsPath = path.resolve(
      path.dirname(resolveRelative(componentPath)),
      'migrations',
    )

    if (fs.existsSync(migrationsPath)) {
      migrationPaths.push(migrationsPath)
    }

    if (component.extending) {
      getPathsRecursively(component.extending)
    }
  }

  if (config.has('pubsweet.components')) {
    config.get('pubsweet.components').forEach(componentPath => {
      getPathsRecursively(componentPath)
    })
  }

  migrationPaths.push(path.resolve(__dirname, 'coreMigrations'))

  return migrationPaths
}

const getGlobPattern = () => {
  const migrationPaths = getMigrationPaths()

  const pattern = migrationPaths
    .map(migrationPath => `${migrationPath}/*.{js,sql}`)
    .join(',')

  return `{${pattern}}`
}

const customStorage = {
  async logMigration(migration) {
    await db.raw('INSERT INTO migrations (id) VALUES (?)', [migration.name])
  },

  async unlogMigration(migration) {
    await db.raw('DELETE FROM migrations WHERE id = ?', [migration.name])
  },

  async executed() {
    await db.raw(
      `CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        run_at TIMESTAMPTZ DEFAULT current_timestamp
      )`,
    )
    const { rows } = await db.raw('SELECT id FROM migrations')
    return rows.map(row => row.id)
  },
}

const getTimestampFromName = migrationName => {
  const migrationUnixTimestampStr = migrationName.split('-')[0]
  const migrationUnixTimestamp = parseInt(migrationUnixTimestampStr, 10)
  return migrationUnixTimestamp
}

const isMigrationAfterThreshold = (migrationName, threshold) => {
  const migrationUnixTimestamp = getTimestampFromName(migrationName)
  return migrationUnixTimestamp > threshold
}

/**
 * Any positive integer is a valid unix timestamp, might wanna switch to umzug's
 * filename convention further down the line for robustness.
 *
 * The current setup will work as long as the date is not less 1000000000 (some time in 2001).
 */
const isUnixTimestamp = input => {
  return Number.isInteger(input) && input >= 1000000000 && input <= 9999999999
}

const doesMigrationFilenameStartWithUnixTimestamp = migrationName => {
  const timestamp = getTimestampFromName(migrationName)
  return isUnixTimestamp(timestamp)
}

const customResolver = (params, threshold) => {
  const { name, path: filePath } = params
  const isSql = extname(filePath) === '.sql'
  const isPastThreshold = isMigrationAfterThreshold(name, threshold)

  if (isPastThreshold) {
    if (isSql) {
      // TO DO -- migration error?
      throw new Error(
        `${v4BaseMessage} migration files must be js files. Use knex.raw if you need to write sql code.`,
      )
    }

    if (!doesMigrationFilenameStartWithUnixTimestamp(name)) {
      throw new Error(
        `${v4BaseMessage} migration files must start with a unix timestamp larger than 1000000000, followed by a dash (-).`,
      )
    }
  }

  if (isSql) {
    return {
      name,
      up: async database => {
        const fileContents = await fs.readFile(filePath, 'utf-8')
        return database.raw(fileContents)
      },
    }
  }

  /* eslint-disable-next-line import/no-dynamic-require, global-require */
  const migration = require(filePath)

  if (isPastThreshold) {
    if (!migration.down || !isFunction(migration.down)) {
      throw new Error(
        `${v4BaseMessage} all migrations need to define a down function so that the migration can be rolled back`,
      )
    }
  }

  return {
    name,
    up: async () => migration.up(db),
    down: async () => migration.down(db),
  }
}

const getUmzug = threshold => {
  const globPattern = getGlobPattern()

  const parent = new Umzug({
    migrations: {
      glob: globPattern,
      resolve: params => customResolver(params, threshold),
    },
    context: { knex: db },
    storage: customStorage,
    logger,
  })

  const umzug = new Umzug({
    ...parent.options,
    migrations: async ctx => {
      const parentMigrations = await parent.migrations()
      const sortedMigrations = sortBy(parentMigrations, 'name')

      return sortedMigrations
    },
  })

  return umzug
}

const getMetaCreated = async () => {
  const tableExists = await db.schema.hasTable('coko_server_meta')
  if (!tableExists) return null

  const { rows } = await db.raw(`SELECT created FROM coko_server_meta`)
  const data = rows[0] // this table always has one row only

  const createdDateAsUnixTimestamp = Math.floor(
    new Date(data.created).getTime() / 1000,
  )

  return createdDateAsUnixTimestamp
}

/**
 * After installing v4, some rules will apply for migrations, but only for new
 * migrations, so that developers don't have to rewrite all existing migrations.
 *
 * The threshold represents from which point in time forward the rules will
 * apply (the creation of the meta table, ie. from the moment they upgraded to
 * coko server v4).
 */
const migrate = async options => {
  const threshold = await getMetaCreated()
  const umzug = getUmzug(threshold)
  await umzug.up(options)
}

module.exports = migrate
