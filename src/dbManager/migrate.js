const fs = require('fs')
const path = require('path')
const { extname } = require('path')
const config = require('config')
const { Umzug } = require('umzug')
const sortBy = require('lodash/sortBy')

const logger = require('../logger')
const db = require('./db')

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
  const migrationsPaths = []

  const getPathsRecursively = componentPath => {
    const component = tryRequireRelative(componentPath)

    const migrationsPath = path.resolve(
      path.dirname(resolveRelative(componentPath)),
      'migrations',
    )

    if (fs.existsSync(migrationsPath)) {
      migrationsPaths.push(migrationsPath)
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

  return migrationsPaths
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

const customResolver = params => {
  const { name, path: filePath } = params

  if (extname(filePath) === '.sql') {
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

  return {
    name,
    up: async () => migration.up(db),
    down: async () => migration.down(db),
  }
}

const getUmzug = () => {
  const globPattern = getGlobPattern()

  const parent = new Umzug({
    migrations: {
      glob: globPattern,
      resolve: customResolver,
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

const migrate = async options => {
  const umzug = getUmzug()
  await umzug.up(options)
}

module.exports = migrate
