import bcrypt from 'bcrypt'

import { ValidationError } from '../../errors'
import logger from '../../logger'
import BaseModel from '../base.model'
import useTransaction from '../useTransaction'
import { displayNameConstructor } from '../_helpers/utilities'
import Identity from '../identity/identity.model'
import Team from '../team/team.model'
import TeamMember from '../teamMember/teamMember.model'

import {
  alphaNumericStringNotNullable,
  booleanDefaultFalse,
  dateNullable,
  password,
  string,
  stringNotEmpty,
  stringNullable,
} from '../_helpers/types'

const BCRYPT_COST = process.env.NODE_ENV === 'test' ? 1 : 12

class User extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'user'
  }

  static get tableName() {
    return 'users'
  }

  // Username & password are not required to allow for scenarios where a user
  // has been created (eg. reviewer invitation), but they have not signed up yet.

  static get schema() {
    return {
      type: 'object',
      required: [],
      properties: {
        username: alphaNumericStringNotNullable,
        passwordHash: stringNotEmpty,
        passwordResetToken: stringNullable,
        passwordResetTimestamp: dateNullable,
        agreedTc: booleanDefaultFalse,
        isActive: booleanDefaultFalse,
        invitationToken: stringNotEmpty,
        invitationTokenTimestamp: dateNullable,
        password,
        givenNames: string,
        surname: string,
        titlePre: string,
        titlePost: string,
      },
    }
  }

  static get relationMappings() {
    return {
      identities: {
        relation: BaseModel.HasManyRelation,
        modelClass: Identity,
        join: {
          from: 'users.id',
          to: 'identities.userId',
        },
      },
      defaultIdentity: {
        relation: BaseModel.HasOneRelation,
        modelClass: Identity,
        join: {
          from: 'users.id',
          to: 'identities.userId',
        },
        filter: builder => {
          builder.where('isDefault', true)
        },
      },
      teams: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Team,
        join: {
          from: 'users.id',
          through: {
            modelClass: TeamMember,
            from: 'team_members.user_id',
            to: 'team_members.team_id',
          },
          to: 'teams.id',
        },
      },
    }
  }

  async patch(data, options = {}) {
    const { password: providedPassword, passwordHash } = data

    if (!providedPassword && !passwordHash) {
      return super.patch(data, options)
    }

    throw new Error(
      'if you want to change user password you should use updatePassword method',
    )
  }

  static async patchAndFetchById(id, data, options = {}) {
    const { password: providedPassword, passwordHash } = data

    if (!providedPassword && !passwordHash) {
      return super.patchAndFetchById(id, data, options)
    }

    throw new Error(
      'if you want to change user password you should use updatePassword method',
    )
  }

  async update(data, options = {}) {
    const { password: providedPassword, passwordHash } = data

    if (!providedPassword && !passwordHash) {
      return super.update(data, options)
    }

    throw new Error(
      'if you want to change user password you should use updatePassword method',
    )
  }

  static async updateAndFetchById(id, data, options = {}) {
    const { password: providedPassword, passwordHash } = data

    if (!providedPassword && !passwordHash) {
      return super.updateAndFetchById(id, data, options)
    }

    throw new Error(
      'if you want to change user password you should use updatePassword method',
    )
  }

  // From https://gitlab.coko.foundation/ncbi/ncbi/-/blob/develop/server/models/user/user.js#L61-101

  static async hasGlobalRole(userId, role, options = {}) {
    try {
      const { trx } = options
      return useTransaction(
        async tr => {
          const isMember = await TeamMember.query(tr)
            .leftJoin('teams', 'team_members.teamId', 'teams.id')
            .findOne({
              global: true,
              role,
              userId,
            })

          return !!isMember
        },
        { trx, passedTrxOnly: true },
      )
    } catch (e) {
      logger.error('User model: hasGlobalRole failed', e)
      throw new Error(e)
    }
  }

  async hasGlobalRole(role, options = {}) {
    return User.hasGlobalRole(this.id, role, options)
  }

  static async hasRoleOnObject(userId, role, objectId, options = {}) {
    try {
      const { trx } = options
      return useTransaction(
        async tr => {
          const isMember = await TeamMember.query(tr)
            .leftJoin('teams', 'team_members.teamId', 'teams.id')
            .findOne({
              role,
              userId,
              objectId,
            })

          return !!isMember
        },
        { trx, passedTrxOnly: true },
      )
    } catch (e) {
      logger.error('User model: hasRoleOnObject failed', e)
      throw new Error(e)
    }
  }

  async hasRoleOnObject(role, objectId, options = {}) {
    return User.hasRoleOnObject(this.id, role, objectId, options)
  }

  static async getTeams(userId, options = {}) {
    try {
      const { trx } = options

      const userWithTeams = await User.query(trx)
        .findById(userId)
        .withGraphFetched('teams')
        .throwIfNotFound()

      return userWithTeams.teams
    } catch (e) {
      logger.error(`User model: getTeams: ${e.message}`)
      throw new Error(e)
    }
  }

  async getTeams() {
    return User.getTeams(this.id)
  }

  async getDisplayName() {
    const { givenNames, surname, username } = this

    return displayNameConstructor(givenNames, surname, username)
  }

  static async updatePassword(
    userId,
    currentPassword,
    newPassword,
    passwordResetToken,
    options = {},
  ) {
    try {
      const { trx } = options
      return useTransaction(
        async tr => {
          const user = await User.findById(userId, {
            trx: tr,
            related: 'defaultIdentity',
          })

          if (currentPassword && !passwordResetToken) {
            if (!(await user.isPasswordValid(currentPassword))) {
              throw new ValidationError(
                'Update password: Current password is not valid',
              )
            }
          } else if (user.passwordResetToken !== passwordResetToken) {
            throw new ValidationError(
              'Update password: passwordResetToken is not valid',
            )
          }

          if (await user.isPasswordValid(newPassword)) {
            throw new ValidationError(
              'Update password: New password must be different from current password',
            )
          }

          return user.$query(tr).patchAndFetch({
            password: newPassword,
          })
        },
        { trx, passedTrxOnly: true },
      )
    } catch (e) {
      logger.error('User model: updatePassword failed', e)
      throw new Error('User model: Cannot update password')
    }
  }

  async updatePassword(
    currentPassword,
    newPassword,
    passwordResetToken,
    options = {},
  ) {
    return User.updatePassword(
      this.id,
      currentPassword,
      newPassword,
      passwordResetToken,
      options,
    )
  }

  $formatJson(json) {
    json = super.$formatJson(json)

    delete json.passwordHash
    return json
  }

  static async hashPassword(plaintext) {
    return bcrypt.hash(plaintext, BCRYPT_COST)
  }

  async hashPassword(plaintext) {
    this.passwordHash = await bcrypt.hash(plaintext, BCRYPT_COST)
    delete this.password
  }

  async $beforeInsert(queryContext) {
    if (this.password) await this.hashPassword(this.password)
    super.$beforeInsert(queryContext)
  }

  async $beforeUpdate() {
    if (this.password) await this.hashPassword(this.password)
    super.$beforeUpdate()
  }

  async isPasswordValid(plaintext) {
    return plaintext && this.passwordHash
      ? bcrypt.compare(plaintext, this.passwordHash)
      : false
  }

  static async activateUsers(ids, options = {}) {
    try {
      const { trx } = options
      return useTransaction(
        async tr => {
          return User.query(tr)
            .patch({ isActive: true })
            .whereIn('id', ids)
            .returning('*')
        },
        { trx, passedTrxOnly: true },
      )
    } catch (e) {
      logger.error('User model: activateUsers failed', e)
      throw new Error('User model: Cannot update isActive')
    }
  }

  static async deactivateUsers(ids, options = {}) {
    try {
      const { trx } = options
      return useTransaction(
        async tr => {
          return User.query(tr)
            .patch({ isActive: false })
            .whereIn('id', ids)
            .returning('*')
        },
        { trx, passedTrxOnly: true },
      )
    } catch (e) {
      logger.error('User model: deactivateUsers failed', e)
      throw new Error('User model: Cannot update isActive')
    }
  }
}

export default User
