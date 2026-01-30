import bcrypt from 'bcrypt'
import { PartialModelObject, Pojo, RelationMappings } from 'objection'

import { ValidationError } from '../../errors'
import logger from '../../logger'
import BaseModel, { TrxOption, TrxAndRelatedOptions } from '../base.model'
import useTransaction from '../useTransaction'
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
  agreedTc!: boolean
  givenNames!: string
  invitationToken!: string
  invitationTokenTimestamp!: Date
  isActive!: boolean
  password!: string
  passwordHash!: string
  passwordResetTimestamp!: Date
  passwordResetToken!: string
  surname!: string
  titlePost!: string
  titlePre!: string
  username!: string

  defaultIdentity!: Identity
  identities!: Identity[]
  teams!: Team[]

  constructor() {
    super()
    this.type = 'user'
  }

  static get tableName(): string {
    return 'users'
  }

  // Username & password are not required to allow for scenarios where a user
  // has been created (eg. reviewer invitation), but they have not signed up yet.

  static get schema(): object {
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

  static get relationMappings(): RelationMappings {
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
        filter: (builder): void => {
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

  async patch(
    data: PartialModelObject<this>,
    options: TrxOption = {},
  ): Promise<this> {
    const { password: providedPassword, passwordHash } =
      data as PartialModelObject<User>

    if (!providedPassword && !passwordHash) {
      return super.patch(data, options)
    }

    throw new Error(
      'if you want to change user password you should use updatePassword method',
    )
  }

  static async patchAndFetchById<T extends BaseModel>(
    this: new () => T,
    id: string,
    data: PartialModelObject<T>,
    options: TrxAndRelatedOptions = {},
  ): Promise<T> {
    const { password: providedPassword, passwordHash } =
      data as PartialModelObject<User>

    if (!providedPassword && !passwordHash) {
      return super.patchAndFetchById<T>(id, data, options)
    }

    throw new Error(
      'if you want to change user password you should use updatePassword method',
    )
  }

  async update(
    data: PartialModelObject<this>,
    options: TrxOption = {},
  ): Promise<this> {
    const { password: providedPassword, passwordHash } =
      data as PartialModelObject<User>

    if (!providedPassword && !passwordHash) {
      return super.update(data, options)
    }

    throw new Error(
      'if you want to change user password you should use updatePassword method',
    )
  }

  static async updateAndFetchById<T extends BaseModel>(
    this: new () => T,
    id: string,
    data: PartialModelObject<T>,
    options: TrxAndRelatedOptions = {},
  ): Promise<T> {
    const { password: providedPassword, passwordHash } =
      data as PartialModelObject<User>

    if (!providedPassword && !passwordHash) {
      return super.updateAndFetchById<T>(id, data, options)
    }

    throw new Error(
      'if you want to change user password you should use updatePassword method',
    )
  }

  // From https://gitlab.coko.foundation/ncbi/ncbi/-/blob/develop/server/models/user/user.js#L61-101

  static async hasGlobalRole(
    userId: string,
    role: string,
    options: TrxOption = {},
  ): Promise<boolean> {
    try {
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
        { trx: options.trx, passedTrxOnly: true },
      )
    } catch (e) {
      logger.error('User model: hasGlobalRole failed', e)
      throw e
    }
  }

  async hasGlobalRole(role: string, options: TrxOption = {}): Promise<boolean> {
    return User.hasGlobalRole(this.id, role, options)
  }

  static async hasRoleOnObject(
    userId: string,
    role: string,
    objectId: string,
    options: TrxOption = {},
  ): Promise<boolean> {
    try {
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
        { trx: options.trx, passedTrxOnly: true },
      )
    } catch (e) {
      logger.error('User model: hasRoleOnObject failed', e)
      throw e
    }
  }

  async hasRoleOnObject(
    role: string,
    objectId: string,
    options: TrxOption = {},
  ): Promise<boolean> {
    return User.hasRoleOnObject(this.id, role, objectId, options)
  }

  static async getTeams(
    userId: string,
    options: TrxOption = {},
  ): Promise<Team[]> {
    try {
      const userWithTeams = await User.query(options.trx)
        .findById(userId)
        .withGraphFetched('teams')
        .throwIfNotFound()

      return userWithTeams.teams
    } catch (e) {
      logger.error(`User model: getTeams: ${e.message}`)
      throw e
    }
  }

  async getTeams(): Promise<Team[]> {
    return User.getTeams(this.id)
  }

  static async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    passwordResetToken?: string,
    options: TrxOption = {},
  ): Promise<User> {
    try {
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
        { trx: options.trx, passedTrxOnly: true },
      )
    } catch (e) {
      logger.error('User model: updatePassword failed', e)
      throw new Error('User model: Cannot update password')
    }
  }

  async updatePassword(
    currentPassword: string,
    newPassword: string,
    passwordResetToken: string,
    options: TrxOption = {},
  ): Promise<User> {
    return User.updatePassword(
      this.id,
      currentPassword,
      newPassword,
      passwordResetToken,
      options,
    )
  }

  $formatJson(json: Pojo): Pojo {
    json = super.$formatJson(json)

    delete json.passwordHash
    return json
  }

  static async hashPassword(plaintext: string): Promise<string> {
    return await bcrypt.hash(plaintext, BCRYPT_COST)
  }

  async hashPassword(plaintext: string): Promise<void> {
    this.passwordHash = await bcrypt.hash(plaintext, BCRYPT_COST)
    delete this.password
  }

  async $beforeInsert(): Promise<void> {
    if (this.password) await this.hashPassword(this.password)
    super.$beforeInsert()
  }

  async $beforeUpdate(): Promise<void> {
    if (this.password) await this.hashPassword(this.password)
    super.$beforeUpdate()
  }

  async isPasswordValid(plaintext: string): Promise<boolean> {
    if (!plaintext || !this.passwordHash) return false
    return await bcrypt.compare(plaintext, this.passwordHash)
  }

  static async activateUsers(
    ids: string[],
    options: TrxOption = {},
  ): Promise<User[]> {
    try {
      return useTransaction(
        async tr => {
          return User.query(tr)
            .patch({ isActive: true })
            .whereIn('id', ids)
            .returning('*')
        },
        { trx: options.trx, passedTrxOnly: true },
      )
    } catch (e) {
      logger.error('User model: activateUsers failed', e)
      throw new Error('User model: Cannot update isActive')
    }
  }

  static async deactivateUsers(
    ids: string[],
    options: TrxOption = {},
  ): Promise<User[]> {
    try {
      return useTransaction(
        async tr => {
          return User.query(tr)
            .patch({ isActive: false })
            .whereIn('id', ids)
            .returning('*')
        },
        { trx: options.trx, passedTrxOnly: true },
      )
    } catch (e) {
      logger.error('User model: deactivateUsers failed', e)
      throw new Error('User model: Cannot update isActive')
    }
  }
}

export default User
