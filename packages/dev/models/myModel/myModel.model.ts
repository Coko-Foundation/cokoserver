import { BaseModel, modelJsonSchemaTypes } from '@coko/server'

const { boolean } = modelJsonSchemaTypes

class MyModel extends BaseModel {
  constructor() {
    super()
    this.type = 'myModel'
  }

  static get tableName(): string {
    return 'myModels'
  }

  static get schema(): object {
    return {
      type: 'object',
      required: [],
      properties: {
        custom: boolean,
      },
    }
  }
}

export default MyModel
