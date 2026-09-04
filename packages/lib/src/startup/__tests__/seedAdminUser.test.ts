import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'

import config from '../../configManager/config'
import { db } from '../../db'
import DbTestUtils from '../../db/DbTestUtils'
import { User, Identity, Team } from '../../models'

import seedAdminUser from '../seedAdminUser'

describe('Seed admin user', () => {
  const getAdminTeam = async (): Promise<Team> => {
    return await Team.findOne({ role: 'admin' }, { related: 'members' })
  }

  beforeAll(async () => {
    await config.init({ mailer: false })
    db.init()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()

    await Team.insert({
      global: true,
      role: 'admin',
      displayName: 'Admin',
    })
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  it('adds an admin user when none exists', async () => {
    await seedAdminUser({
      username: 'admin',
      password: 'password',
      email: 'admin@example.com',
    })

    const adminTeam = await getAdminTeam()
    expect(adminTeam.members).toHaveLength(1)
  })

  it('throws an error no data is provided and no other admin users exist', async () => {
    await expect(() => seedAdminUser()).rejects.toThrow()
  })

  it('allows you to not pass any user data if another admin user exists', async () => {
    await seedAdminUser({
      username: 'admin',
      password: 'password',
      email: 'admin@example.com',
    })

    await seedAdminUser()

    const adminTeam = await getAdminTeam()
    expect(adminTeam.members).toHaveLength(1)
  })

  it('adds the user to the admin team if the user exists but is not already a member', async () => {
    const u = await User.insert({
      username: 'admin',
      password: 'password',
    })

    await Identity.insert({
      userId: u.id,
      email: 'admin@example.com',
      isSocial: false,
      isVerified: true,
      isDefault: true,
    })

    let adminTeam = await getAdminTeam()
    expect(adminTeam.members).toHaveLength(0)

    await seedAdminUser({
      username: 'admin',
      password: 'password',
      email: 'admin@example.com',
    })

    adminTeam = await getAdminTeam()
    expect(adminTeam.members).toHaveLength(1)
  })

  it('does nothing if the user is already and admin', async () => {
    await seedAdminUser({
      username: 'admin',
      password: 'password',
      email: 'admin@example.com',
    })

    await seedAdminUser({
      username: 'admin',
      password: 'password',
      email: 'admin@example.com',
    })

    const adminTeam = await getAdminTeam()
    expect(adminTeam.members).toHaveLength(1)
  })
})
