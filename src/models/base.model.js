const { Model, AjvValidator } = require('objection')
const config = require('config')
const merge = require('lodash/merge')
const uuid = require('uuid')
const addFormats = require('ajv-formats')

const { db } = require('../db')
const logger = require('../logger')
const useTransaction = require('./useTransaction')

const { dateNotNullable } = require('./_helpers/types')

Model.knex(db)

class BaseModel extends Model {
  static createValidator() {
    return new AjvValidator({
      onCreateAjv: ajv => {
        addFormats(ajv)
      },
    })
  }

  static get jsonSchema() {
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
        created: dateNotNullable,
        updated: dateNotNullable,
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
      return this.query(options.trx).deleteById(id).throwIfNotFound()
    } catch (e) {
      logger.error(`${this.name} model: deleteById failed.`, e)
      throw e
    }
  }

  static async deleteByIds(ids, options = {}) {
    try {
      const rows = await this.query(options.trx).findByIds(ids)

      if (rows.length < ids.length) {
        const diff = ids.filter(id => !rows.map(res => res.id).includes(id))

        throw new Error(
          `id${diff.length > 1 ? 's' : ''} ${diff.join(', ')} not found`,
        )
      }

      const result = await this.query(options.trx)
        .delete()
        .whereIn('id', ids)
        .returning('id')

      return result.map(u => u.id)
    } catch (e) {
      logger.error(`${this.name} model: deleteByIds failed`, e)
      throw new Error(e)
    }
  }
}

BaseModel.pickJsonSchemaProperties = false

module.exports = BaseModel
