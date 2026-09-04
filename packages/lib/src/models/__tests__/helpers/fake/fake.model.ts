import { RelationMappings } from 'objection'

import BaseModel from '../../../base.model'
import User from '../../../user/user.model'

import {
  id,
  stringNullable,
  integerPositive,
  dateNullable,
} from '../../../_helpers/types'

class Fake extends BaseModel {
  status!: string
  userId!: string
  user!: User

  constructor() {
    super()
    this.type = 'fake'
  }

  static get tableName(): string {
    return 'fakes'
  }

  static get schema(): object {
    return {
      type: 'object',
      required: [],
      properties: {
        status: stringNullable,
        userId: id,
        index: integerPositive,
        timestamp: dateNullable,
      },
    }
  }

  static get relationMappings(): RelationMappings {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'fakes.userId',
          to: 'users.id',
        },
      },
    }
  }
}

export default Fake
