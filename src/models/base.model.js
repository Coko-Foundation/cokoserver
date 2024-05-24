const { Model } = require('objection')
const config = require('config')
const merge = require('lodash/merge')
const uuid = require('uuid')

const db = require('../dbManager/db')
const logger = require('../logger')
const useTransaction = require('./useTransaction')

Model.knex(db)

class BaseModel extends Model {
  static get jsonSchema() {
    // JSON schema validation is getting proper support for inheritance in
    // its draft 8: https://github.com/json-schema-org/json-schema-spec/issues/556
    // Until then, we're not using additionalProperties: false, and letting the
    // database handle this bit of the integrity checks.

    let schema

    const mergeSchema = additionalSchema => {
      if (additionalSchema) {
        schema = merge(schema, additionalSchema)
      }
    }

    // Crawls up the prototype chain to collect schema
    // information from models and extended models
    const getSchemasRecursively = object => {
      mergeSchema(object.schema)

      if (config.has('schema')) {
        mergeSchema(config.schema[object.name])
      }

      const proto = Object.getPrototypeOf(object)

      if (proto.name !== 'BaseModel') {
        getSchemasRecursively(proto)
      }
    }

    getSchemasRecursively(this)

    const baseSchema = {
      type: 'object',
      properties: {
        type: { type: 'string' },
        id: { type: 'string', format: 'uuid' },
        created: { type: ['string', 'object'], format: 'date-time' },
        updated: { type: ['string', 'object'], format: 'date-time' },
      },
      additionalProperties: false,
    }

    if (schema) {
      return merge(baseSchema, schema)
    }

    return baseSchema
  }

  $beforeInsert() {
    this.id = this.id || uuid.v4()
    this.created = new Date().toISOString()
    this.updated = this.created
  }

  $beforeUpdate() {
    this.updated = new Date().toISOString()
  }

  static async find(data, options = {}) {
    try {
      const { trx, related, orderBy, page, pageSize } = options

      return useTransaction(
        async tr => {
          let queryBuilder = this.query(tr)

          if (orderBy) {
            queryBuilder = queryBuilder.orderBy(orderBy)
          }

          if (
            (Number.isInteger(page) && !Number.isInteger(pageSize)) ||
            (!Number.isInteger(page) && Number.isInteger(pageSize))
          ) {
            throw new Error(
              'both page and pageSize integers needed for paginated results',
            )
          }

          if (Number.isInteger(page) && Number.isInteger(pageSize)) {
            if (page < 0) {
              throw new Error(
                'invalid index for page (page should be an integer and greater than or equal to 0)',
              )
            }

            if (pageSize <= 0) {
              throw new Error(
                'invalid size for pageSize (pageSize should be an integer and greater than 0)',
              )
            }

            queryBuilder = queryBuilder.page(page, pageSize)
          }

          if (related) {
            queryBuilder = queryBuilder.withGraphFetched(related)
          }

          const result = await queryBuilder.where(data)

          const { results, total } = result

          return {
            result: page !== undefined ? results : result,
            totalCount: total || result.length,
          }
        },
        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: find failed', e)
      throw new Error(e)
    }
  }

  static async findByIds(ids, options = {}) {
    try {
      const { trx, related } = options

      return useTransaction(
        async tr => {
          let queryBuilder = this.query(tr)

          if (related) {
            queryBuilder = queryBuilder.withGraphFetched(related)
          }

          const result = await queryBuilder.findByIds(ids)

          if (result.length < ids.length) {
            const delta = ids.filter(
              id => !result.map(res => res.id).includes(id),
            )

            throw new Error(`id ${delta} not found`)
          }

          return result
        },

        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: findByIds failed', e)
      throw new Error(e)
    }
  }

  static async findById(id, options = {}) {
    try {
      const { trx, related } = options

      return useTransaction(
        async tr => {
          let queryBuilder = this.query(tr)

          if (related) {
            queryBuilder = queryBuilder.withGraphFetched(related)
          }

          return queryBuilder.findById(id).throwIfNotFound()
        },
        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: findById failed', e)
      throw new Error(e)
    }
  }

  static async findOne(data, options = {}) {
    try {
      const { trx, related } = options

      return useTransaction(
        async tr => {
          let queryBuilder = this.query(tr)

          if (related) {
            queryBuilder = queryBuilder.withGraphFetched(related)
          }

          return queryBuilder.findOne(data)
        },
        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: findOne failed', e)
      throw new Error(e)
    }
  }

  static async insert(data, options = {}) {
    try {
      const { trx, related } = options

      return useTransaction(
        async tr => {
          let queryBuilder = this.query(tr)

          if (related) {
            queryBuilder = queryBuilder.withGraphFetched(related)
          }

          return queryBuilder.insert(data)
        },

        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: insert failed', e)
      throw new Error(e)
    }
  }

  // INSTANCE METHOD
  async patch(data, options = {}) {
    try {
      const { trx } = options

      if (!data) {
        throw new Error('Patch is empty')
      }

      return useTransaction(async tr => this.$query(tr).patch(data), {
        trx,
        passedTrxOnly: true,
      })
    } catch (e) {
      logger.error('Base model: patch failed', e)
      throw new Error(e)
    }
  }

  static async patchAndFetchById(id, data, options = {}) {
    try {
      const { trx, related } = options

      return useTransaction(
        async tr => {
          let queryBuilder = this.query(tr)

          if (related) {
            queryBuilder = queryBuilder.withGraphFetched(related)
          }

          return queryBuilder.patchAndFetchById(id, data).throwIfNotFound()
        },
        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: patchAndFetchById failed', e)
      throw new Error(e)
    }
  }

  // INSTANCE METHOD
  async update(data, options = {}) {
    try {
      const { trx } = options

      if (!data) {
        throw new Error('Patch is empty')
      }

      return useTransaction(async tr => this.$query(tr).update(data), {
        trx,
        passedTrxOnly: true,
      })
    } catch (e) {
      logger.error('Base model: update failed', e)
      throw new Error(e)
    }
  }

  static async updateAndFetchById(id, data, options = {}) {
    try {
      const { trx, related } = options

      return useTransaction(
        async tr => {
          let queryBuilder = this.query(tr)

          if (related) {
            queryBuilder = queryBuilder.withGraphFetched(related)
          }

          return queryBuilder.updateAndFetchById(id, data).throwIfNotFound()
        },
        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: updateAndFetchById failed', e)
      throw new Error(e)
    }
  }

  static async deleteById(id, options = {}) {
    try {
      const { trx } = options
      return useTransaction(
        async tr => this.query(tr).deleteById(id).throwIfNotFound(),
        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: deleteById failed', e)
      throw new Error(e)
    }
  }

  static async deleteByIds(ids, options = {}) {
    try {
      const { trx } = options
      return useTransaction(
        async tr => {
          const result = await this.query(tr)
            .delete()
            .whereIn('id', ids)
            .returning('id')

          if (result.length < ids.length) {
            const delta = ids.filter(
              id => !result.map(res => res.id).includes(id),
            )

            throw new Error(`id ${delta} not found`)
          }

          return result.map(u => u.id)
        },
        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: deleteByIds failed', e)
      throw new Error(e)
    }
  }
}

BaseModel.pickJsonSchemaProperties = false

module.exports = BaseModel
