import BaseModel from '../base.model'
import User from '../user/user.model'

import {
  id,
  stringNotEmpty,
  stringNullable,
  object,
  objectNullable,
} from '../_helpers/types'

const affectedObject = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'objectType'],
  properties: {
    id,
    objectType: stringNotEmpty,
  },
}

const affectedObjects = {
  type: 'array',
  default: [],
  items: affectedObject,
}

class ActivityLog extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'activityLog'
  }

  static get tableName(): string {
    return 'activityLogs'
  }

  static get schema() {
    return {
      type: 'object',
      required: ['actorId', 'actionType'],
      properties: {
        actorId: id,
        actionType: stringNotEmpty,
        message: stringNullable,
        valueBefore: objectNullable,
        valueAfter: objectNullable,
        affectedObjects,
        additionalData: object,
      },
    }
  }

  static get relationMappings() {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'activityLogs.actorId',
          to: 'users.id',
        },
      },
    }
  }
}

export default ActivityLog
