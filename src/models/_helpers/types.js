const { rolesEnum, displayNamesEnum } = require('./teams')

const alphaNumericStringNotNullable = {
  type: 'string',
  pattern: '^[a-zA-Z0-9]+',
}

const boolean = {
  type: 'boolean',
}

const booleanNullable = {
  type: ['boolean', 'null'],
  default: null,
}

const booleanDefaultFalse = {
  type: 'boolean',
  default: false,
}

const booleanDefaultTrue = {
  type: 'boolean',
  default: true,
}

const dateNotNullable = {
  anyOf: [{ type: 'string', format: 'date-time' }, { type: 'object' }],
}

const dateNullable = {
  anyOf: [
    { type: 'string', format: 'date-time' },
    { type: 'object' },
    { type: 'null' },
  ],
  default: null,
}

const email = {
  type: 'string',
  format: 'email',
}

const id = {
  type: 'string',
  format: 'uuid',
}

const idNullable = {
  type: ['string', 'null'],
  format: 'uuid',
  default: null,
}

const integerPositive = {
  type: 'integer',
  minimum: 1,
}

const object = {
  type: 'object',
}

const objectNullable = {
  type: ['object', 'null'],
  default: null,
}

const password = {
  type: 'string',
  minLength: 8,
}

const string = {
  type: 'string',
}

const stringNotEmpty = {
  type: 'string',
  minLength: 1,
}

const stringNullable = {
  type: ['string', 'null'],
  default: null,
}

const arrayOfIds = {
  type: 'array',
  items: id,
  default: [],
}

const arrayOfObjects = {
  type: 'array',
  items: object,
}

const arrayOfObjectsNullable = {
  type: ['array', 'null'],
  items: object,
  default: null,
}

const arrayOfStrings = {
  type: 'array',
  items: stringNotEmpty,
  default: [],
}

const teamRoles = {
  type: 'string',
  enum: rolesEnum,
}

const teamDisplayNames = {
  type: 'string',
  enum: displayNamesEnum,
}

module.exports = {
  alphaNumericStringNotNullable,
  arrayOfIds,
  arrayOfObjects,
  arrayOfObjectsNullable,
  arrayOfStrings,
  boolean,
  booleanNullable,
  booleanDefaultFalse,
  booleanDefaultTrue,
  dateNotNullable,
  dateNullable,
  email,
  id,
  idNullable,
  integerPositive,
  object,
  objectNullable,
  password,
  string,
  stringNotEmpty,
  stringNullable,
  teamRoles,
  teamDisplayNames,
}
