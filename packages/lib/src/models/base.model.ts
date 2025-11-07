import {
  Model,
  AjvValidator,
  ColumnRefOrOrderByDescriptor,
  Transaction,
  QueryBuilder,
} from 'objection'

import merge from 'lodash/merge'
import { v4 as uuid } from 'uuid'
import addFormats from 'ajv-formats'

import { db } from '../db'
import logger from '../logger'
import useTransaction from './useTransaction'

import { dateNotNullable } from './_helpers/types'

Model.knex(db)

type QueryResult<T> = {
  result: T[]
  totalCount: number
}

type FindOptions = {
  trx?: Transaction
  related?: string | string[]
  orderBy?: ColumnRefOrOrderByDescriptor[]
  page?: number
  pageSize?: number
}

type TrxOption = {
  trx?: Transaction
}

type TrxAndRelatedOptions = {
  trx?: Transaction
  related?: string | string[]
}

class BaseModel extends Model {
  id: string
  created: string
  updated: string
  type: string

  static createValidator(): AjvValidator {
    return new AjvValidator({
      onCreateAjv: (ajv): void => {
        addFormats(ajv)
      },
    })
  }

  static get jsonSchema(): object {
    let schema: object

    const mergeSchema = (additionalSchema): void => {
      if (additionalSchema) {
        schema = merge(schema, additionalSchema)
      }
    }

    // Crawls up the prototype chain to collect schema information from models and extended models
    const getSchemasRecursively = (object): void => {
      mergeSchema(object.schema)
      const proto = Object.getPrototypeOf(object)
      if (proto.name !== 'BaseModel') getSchemasRecursively(proto)
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

  $beforeInsert(): void {
    this.id = this.id || uuid()
    this.created = new Date().toISOString()
    this.updated = this.created
  }

  $beforeUpdate(): void {
    this.updated = new Date().toISOString()
  }

  static async find<T extends BaseModel>(
    data,
    options: FindOptions = {},
  ): Promise<QueryResult<T>> {
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

  static async findByIds<T extends BaseModel>(
    ids: string[],
    options: TrxAndRelatedOptions = {},
  ): Promise<QueryResult<T>> {
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

  static async findById<T extends BaseModel>(
    id,
    options: TrxAndRelatedOptions = {},
  ): Promise<T> {
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

  static async findOne<T extends BaseModel>(
    data,
    options: TrxAndRelatedOptions = {},
  ): Promise<T> {
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

  static async insert<T extends BaseModel>(
    data,
    options: TrxAndRelatedOptions = {},
  ): Promise<T> {
    try {
      const { trx, related } = options
      // console.log('insert trx', trx)

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
  async patch<T extends BaseModel>(data, options: TrxOption = {}): Promise<T> {
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

  static async patchAndFetchById<M extends typeof BaseModel>(
    this: M,
    id,
    data: Partial<InstanceType<M>>,
    options: TrxAndRelatedOptions = {},
  ): Promise<InstanceType<M>> {
    try {
      const { trx, related } = options

      return useTransaction(
        async tr => {
          let queryBuilder = this.query(tr)

          if (related) {
            queryBuilder = queryBuilder.withGraphFetched(related)
          }

          const x = await queryBuilder
            .patchAndFetchById(id, data)
            .throwIfNotFound()

          return x as Promise<InstanceType<M>>
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
  async update<T extends BaseModel>(data, options: TrxOption = {}): Promise<T> {
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

  static async updateAndFetchById<T extends BaseModel>(
    id,
    data,
    options: TrxAndRelatedOptions = {},
  ): Promise<T> {
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

  static async deleteById(id, options: TrxOption = {}): Promise<number> {
    try {
      return this.query(options.trx).deleteById(id).throwIfNotFound()
    } catch (e) {
      logger.error(`${this.name} model: deleteById failed.`, e)
      throw e
    }
  }

  static async deleteByIds(ids, options: TrxOption = {}): Promise<number> {
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

      return result.length
    } catch (e) {
      logger.error(`${this.name} model: deleteByIds failed`, e)
      throw new Error(e)
    }
  }
}

BaseModel.pickJsonSchemaProperties = false

export default BaseModel
