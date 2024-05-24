const BaseModel = require('../../../base.model')

const {
  id,
  stringNullable,
  integerPositive,
  dateNullable,
} = require('../../../_helpers/types')

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
    /* eslint-disable-next-line global-require */
    const { User } = require('../../../index')

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

module.exports = Fake
