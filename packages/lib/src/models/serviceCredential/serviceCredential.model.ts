import BaseModel from '../base.model'

import { string, stringNotEmpty } from '../_helpers/types'

class ServiceCredential extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'serviceCredential'
  }

  static get tableName() {
    return 'serviceCredential'
  }

  static get schema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        name: stringNotEmpty,
        accessToken: string,
      },
    }
  }
}

export default ServiceCredential
