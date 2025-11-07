import { describe, beforeAll, afterAll, afterEach, it, expect } from 'vitest'
import { Transaction } from 'objection'
import useTransaction from '../useTransaction'
import clearDb from '../_helpers/clearDb'
import { migrationManager } from '../../db'
import config from '../../configManager/config'
import Team from '../team/team.model'

const createInvalidTeams = async (trx?: Transaction): Promise<void> => {
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

const createValidTeams = async (trx?: Transaction): Promise<void> => {
  await Team.insert(
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
}

describe('Use transaction', () => {
  beforeAll(async () => {
    await clearDb()

    config.reset()
    await config.init({
      components: [
        './src/models/user',
        './src/models/identity',
        './src/models/team',
        './src/models/teamMember',
      ],
      teams: {
        global: [
          {
            displayName: 'Editor',
            role: 'editor',
          },
          {
            displayName: 'Author',
            role: 'author',
          },
        ],
        nonGlobal: [],
      },
    })

    await migrationManager.migrate()
  })

  afterEach(async () => {
    await clearDb()
  })

  afterAll(() => {
    config.reset()
    const knex = Team.knex()
    knex.destroy()
  })

  // No transaction. First one is created, even though the second one failed.
  it('does not use any transaction if passedTrxOnly option is true', async () => {
    const options = { passedTrxOnly: true }

    const withoutTrx = async (): Promise<void> => {
      await useTransaction(createInvalidTeams, options)
    }

    await expect(withoutTrx()).rejects.toThrow()

    const teams = await Team.query()
    expect(teams.length).toEqual(1)
  })

  // Transaction used. Second one fails, first is rolled back as a result.
  it('uses a transaction by default', async () => {
    const withTrx = async (): Promise<void> => {
      await useTransaction(createInvalidTeams)
    }

    await expect(withTrx()).rejects.toThrow()

    const teams = await Team.query()
    expect(teams.length).toEqual(0)

    const withTrxValid = async (): Promise<void> => {
      await useTransaction(createValidTeams)
    }
    await withTrxValid()

    const teamsNow = await Team.query()
    expect(teamsNow.length).toEqual(2)
  })

  it('uses passed transaction if provided', async () => {
    const nesting = async (): Promise<void> => {
      await useTransaction(async trx => {
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
                global: true,
              },
              { trx: nestedTrx },
            ),
          { trx },
        )
      })
    }

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
            { trx: nestedTrx },
          ),
        { trx },
      )
    })

    const newTeams = await Team.query()
    expect(newTeams.length).toEqual(2)
  })

  it('throws with invalid params', async () => {
    // @ts-ignore
    await expect(useTransaction()).rejects.toThrow()
  })
})
