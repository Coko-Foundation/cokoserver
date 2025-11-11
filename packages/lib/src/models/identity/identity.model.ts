import { RelationMappings, Pojo, PartialModelObject } from 'objection'

import BaseModel, {
  TrxAndRelatedOptions,
  FindOptions,
  QueryResult,
} from '../base.model'
import User from '../user/user.model'

import {
  boolean,
  dateNullable,
  email,
  id,
  object,
  stringNullable,
} from '../_helpers/types'

class Identity extends BaseModel {
  email!: string
  isDefault!: boolean
  isSocial!: boolean
  isVerified!: boolean
  oauthAccessToken!: string
  oauthAccessTokenExpiration!: Date
  oauthRefreshToken!: string
  oauthRefreshTokenExpiration!: Date
  profileData!: { [key: string]: unknown }
  provider!: string
  userId!: string
  verificationToken!: string
  verificationTokenTimestamp!: Date

  user!: User

  constructor() {
    super()
    this.type = 'identity'
  }

  static get tableName(): string {
    return 'identities'
  }

  static get schema(): object {
    return {
      type: 'object',
      required: ['email', 'userId'],
      properties: {
        email,
        isDefault: boolean,
        isSocial: boolean,
        isVerified: boolean,
        oauthAccessToken: stringNullable,
        oauthAccessTokenExpiration: dateNullable,
        oauthRefreshToken: stringNullable,
        oauthRefreshTokenExpiration: dateNullable,
        profileData: object,
        provider: stringNullable,
        userId: id,
        verificationToken: stringNullable,
        verificationTokenTimestamp: dateNullable,
      },
    }
  }

  static get relationMappings(): RelationMappings {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'identities.userId',
          to: 'users.id',
        },
      },
    }
  }

  $formatDatabaseJson(json: Pojo): Pojo {
    json = super.$formatDatabaseJson(json)

    if (json.email) {
      return {
        ...json,
        email: json.email.toLowerCase(),
      }
    }

    return json
  }

  static formatIncomingQueryData(
    data: PartialModelObject<Identity>,
  ): PartialModelObject<Identity> {
    let parsedData = { ...data }
    const emailValue = data.email

    if (emailValue && typeof emailValue === 'string') {
      parsedData = {
        ...data,
        email: emailValue.toLowerCase(),
      }
    }

    return parsedData
  }

  static async find<T extends BaseModel>(
    this: new () => T,
    data: PartialModelObject<T>,
    options: FindOptions = {},
  ): Promise<QueryResult<T>> {
    const parsedData = Identity.formatIncomingQueryData(
      data,
    ) as PartialModelObject<T>

    return super.find<T>(parsedData, options)
  }

  static async findOne<T extends BaseModel>(
    this: new () => T,
    data: PartialModelObject<T>,
    options: TrxAndRelatedOptions = {},
  ): Promise<T> {
    const parsedData = Identity.formatIncomingQueryData(
      data,
    ) as PartialModelObject<T>

    return super.findOne<T>(parsedData, options)
  }
}

export default Identity
