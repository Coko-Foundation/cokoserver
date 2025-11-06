import BaseModel from '../base.model'
import User from '../user/user.model'

import {
  boolean,
  dateNullable,
  email,
  id,
  object,
  stringNullable,
} from '../_helpers/types'

const formatIncomingQueryData = data => {
  let parsedData = { ...data }
  const emailValue = data.email

  if (emailValue) {
    parsedData = {
      ...data,
      email: emailValue.toLowerCase(),
    }
  }

  return parsedData
}

class Identity extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'identity'
  }

  static get tableName() {
    return 'identities'
  }

  static get schema() {
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

  static get relationMappings() {
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

  static async find(data, options = {}) {
    const parsedData = formatIncomingQueryData(data)
    return super.find(parsedData, options)
  }

  static async findOne(data, options = {}) {
    const parsedData = formatIncomingQueryData(data)
    return super.findOne(parsedData, options)
  }

  $formatDatabaseJson(json) {
    json = super.$formatDatabaseJson(json)
    const emailValue = json.email
    if (emailValue) return { ...json, email: emailValue.toLowerCase() }
    return { ...json }
  }
}

export default Identity
