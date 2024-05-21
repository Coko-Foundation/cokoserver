/* eslint-disable jest/no-commented-out-tests */

// const path = require('path')
// const config = require('config')

// const mockComponentPath = path.join(__dirname, 'mocks', 'component')

// Object.assign(config, {
//   components: [mockComponentPath],
// })

// const getMigrationPaths = require('../migrationPaths')
// const createTables = require('../createTables')
// const getUmzug = require('../umzug')

// describe('create tables', () => {
//   it('gets migration paths', () => {
//     const paths = getMigrationPaths()
//     expect(paths).toHaveLength(1)
//     expect(paths[0]).toMatch(
//       /dbManager\/__tests__\/mocks\/component\/migrations$/,
//     )
//   })

//   it('runs migrations', async () => {
//     await createTables(true)
//     const { umzug, cleanup } = await getUmzug([])
//     const executedMigrations = await umzug.executed()

//     expect(executedMigrations.map(migration => migration.file)).toEqual([
//       '0001-component.js',
//     ])

//     await cleanup()
//   })

//   it('does run them again', async () => {
//     const { umzug, cleanup } = await getUmzug([])
//     const pendingMigrations = await umzug.pending()
//     expect(pendingMigrations).toEqual([])
//     await cleanup()
//   })
// })
