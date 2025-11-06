import BaseModel from '../../../base.model'
import User from '../../../index'

import {
  id,
  stringNullable,
  integerPositive,
  dateNullable,
} from '../../../_helpers/types'

class Fake extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'fake'
  }

  static get tableName() {
    return 'fakes'
  }

  static get schema() {
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

  static get relationMappings() {
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
