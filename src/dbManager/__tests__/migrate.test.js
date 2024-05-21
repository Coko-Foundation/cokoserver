const config = require('config')

Object.assign(config, {
  /* eslint-disable-next-line node/no-path-concat */
  components: [`${__dirname}/./mocks/componentWithBrokenMigration`],
})

const { migrate } = require('../migrate')

describe('Migrate', () => {
  it('throws an error when a broken migration runs', async () => {
    await expect(migrate()).rejects.toThrow(
      'CREATE A TABLE WITH BROKEN MIGRATION; - syntax error at or near "A"',
    )
  })
})
