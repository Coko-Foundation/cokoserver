import BaseModel from '../base.model'

import { string, stringNotEmpty } from '../_helpers/types'

class ServiceCredential extends BaseModel {
  name!: string
  accessToken!: string

  constructor() {
    super()
    this.type = 'serviceCredential'
  }

  static get tableName(): string {
    return 'serviceCredential'
  }

  static get schema(): object {
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
