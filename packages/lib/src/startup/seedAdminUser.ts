import internalLogger from '../logger/internals'
import useTransaction from '../models/useTransaction'
import User from '../models/user/user.model'
import Team from '../models/team/team.model'
import Identity from '../models/identity/identity.model'
import { AdminUser } from '../configManager/configSchema'
import config from '../configManager/config'

const seedAdminUser = async (data?: AdminUser): Promise<void> => {
  internalLogger.section('Seed admin user')

  if (!config.get('adminUser')) {
    internalLogger.warn(
      'Admin user set to false in config. Skipping user creation...',
    )
    return
  }

  const adminTeam = await Team.findOne(
    { role: 'admin' },
    { related: 'members' },
  )

  if (!data) {
    if (adminTeam.members.length === 0) {
      throw new Error(
        'No members in the admin team and no values provided to create one.',
      )
    }

    internalLogger.point(
      'No admin user data, but another admin user already exists.',
    )
    return
  }

  const adminUser = await User.findOne({
    username: data.username,
  })

  if (adminUser) {
    internalLogger.point('User already exists in database ...')
    const existingUserIsAdmin = await adminUser.hasGlobalRole('admin')

    if (!existingUserIsAdmin) {
      internalLogger.point('... but is not a member of the admin team.')
      await Team.addMember(adminTeam.id, adminUser.id)
      internalLogger.success(`User added to admin team.`)
      return
    }

    internalLogger.point('... and is already a member of the admin team.')
    return
  }

  await useTransaction(async trx => {
    const u = await User.insert(
      {
        username: data.username,
        password: data.password,
      },
      { trx },
    )

    await Identity.insert(
      {
        userId: u.id,
        email: data.email,
        isSocial: false,
        isVerified: true,
        isDefault: true,
      },
      { trx },
    )

    await Team.addMember(adminTeam.id, u.id, { trx })

    internalLogger.success(`User added to admin team.`)
  })
}

export default seedAdminUser
