const { Team } = require('../index')

const useTransaction = require('../useTransaction')
const clearDb = require('../_helpers/clearDb')

const createValidTeams = async trx =>
  Team.insert(
    [
      {
        role: 'editor',
        displayName: 'Editor',
        global: true,
      },
      {
        role: 'author',
        displayName: 'Author',
        global: true,
      },
    ],
    { trx },
  )

const createInvalidTeams = async trx => {
  // works
  await Team.insert(
    {
      role: 'editor',
      displayName: 'Editor',
      global: true,
    },
    { trx },
  )

  // fails
  await Team.insert(
    {
      role: 'editor',
      displayName: 'Editor',
      global: false,
    },
    { trx },
  )
}

describe('Use transaction', () => {
  beforeAll(() => clearDb())
  afterEach(() => clearDb())

  afterAll(() => {
    const knex = Team.knex()
    knex.destroy()
  })

  // No transaction. First one is created, even though the second one failed.
  it('does not use any transaction if passedTrxOnly option is true', async () => {
    const options = { passedTrxOnly: true }
    const withoutTrx = () => useTransaction(createInvalidTeams, options)
    await expect(withoutTrx()).rejects.toThrow()

    const teams = await Team.query()
    expect(teams.length).toEqual(1)
  })

  // Transaction used. Second one fails, first is rolled back as a result.
  it('uses a transaction by default', async () => {
    const withTrx = () => useTransaction(createInvalidTeams)
    await expect(withTrx()).rejects.toThrow()

    const teams = await Team.query()
    expect(teams.length).toEqual(0)

    const withTrxValid = () => useTransaction(createValidTeams)
    await withTrxValid()

    const teamsNow = await Team.query()
    expect(teamsNow.length).toEqual(2)
  })

  it('uses passed transaction if provided', async () => {
    const nesting = () =>
      useTransaction(async trx => {
        await Team.insert(
          {
            role: 'editor',
            displayName: 'Editor',
            global: true,
          },
          { trx },
        )

        // this will make the whole transaction fail
        await useTransaction(
          async nestedTrx =>
            Team.insert(
              {
                role: 'editor',
                displayName: 'Editor',
                global: true, // ivalid option
              },
              { trx },
            ),
          { trx },
        )
      })

    // Nothing will be created, as the inner `useTransaction` failed
    await expect(nesting()).rejects.toThrow()

    const teams = await Team.query()
    expect(teams.length).toEqual(0)

    await useTransaction(async trx => {
      await Team.insert(
        {
          role: 'editor',
          displayName: 'Editor',
          global: true,
        },
        { trx },
      )

      // uses trx passed from parent
      await useTransaction(
        async nestedTrx =>
          Team.insert(
            {
              role: 'author',
              displayName: 'Author',
              global: true,
            },
            { trx },
          ),
        { trx },
      )
    })

    const newTeams = await Team.query()
    expect(newTeams.length).toEqual(2)
  })

  it('throws with invalid params', async () => {
    await expect(useTransaction()).rejects.toThrow()
  })
})
