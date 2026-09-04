import {
  Model,
  AjvValidator,
  ColumnRefOrOrderByDescriptor,
  Transaction,
  QueryBuilder,
  Page,
  PartialModelObject,
} from 'objection'

import merge from 'lodash/merge'
import { v4 as uuid } from 'uuid'
import addFormats from 'ajv-formats'

import { db } from '../db'
import logger from '../logger'
import useTransaction from './useTransaction'

import { dateNotNullable } from './_helpers/types'

Model.knex(db)

export type QueryResult<T> = {
  result: T[]
  totalCount: number
}

type ModelQueryBuilder<T extends BaseModel> = QueryBuilder<T, T[]>
type PaginatedModelQueryBuilder<T extends BaseModel> = QueryBuilder<T, Page<T>>
type ModelFindQueryBuilder<T extends BaseModel> =
  | ModelQueryBuilder<T>
  | PaginatedModelQueryBuilder<T>

type ModelSingleResult<T extends BaseModel> = QueryBuilder<T, T>

export type FindOptions = {
  trx?: Transaction
  related?: string | string[]
  orderBy?: ColumnRefOrOrderByDescriptor[]
  page?: number
  pageSize?: number
}

export type TrxOption = {
  trx?: Transaction
}

export type TrxAndRelatedOptions = {
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
    // this: { new (): T } & typeof BaseModel,
    this: new () => T,
    data: PartialModelObject<T>,
    options: FindOptions = {},
  ): Promise<QueryResult<T>> {
    try {
      const ModelClass = this as typeof BaseModel & { new (): T }
      const { trx, related, orderBy, page, pageSize } = options

      return useTransaction(
        async tr => {
          let queryBuilder: ModelFindQueryBuilder<T> = ModelClass.query(
            tr,
          ) as ModelQueryBuilder<T>

          const isPaginated =
            Number.isInteger(page) && Number.isInteger(pageSize)

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

          if (isPaginated) {
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

            queryBuilder = queryBuilder.page(
              page,
              pageSize,
            ) as PaginatedModelQueryBuilder<T>
          }

          if (related) {
            queryBuilder = queryBuilder.withGraphFetched(related)
          }

          const rawResult = await queryBuilder.where(data)

          if (isPaginated) {
            const result = rawResult as Page<T>

            return {
              result: result.results,
              totalCount: result.total,
            }
          }

          const result = rawResult as T[]

          return {
            result: result,
            totalCount: result.length,
          }
        },
        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: find failed', e)
      throw e
    }
  }

  static async findByIds<T extends BaseModel>(
    // this: { new (): T } & typeof BaseModel,
    this: new () => T,
    ids: string[],
    options: TrxAndRelatedOptions = {},
  ): Promise<T[]> {
    try {
      const ModelClass = this as typeof BaseModel & { new (): T }
      const { trx, related } = options

      return useTransaction(
        async tr => {
          let queryBuilder = ModelClass.query(tr) as ModelQueryBuilder<T>

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
      throw e
    }
  }

  static async findById<T extends BaseModel>(
    // this: { new (): T } & typeof BaseModel,
    this: new () => T,
    id: string,
    options: TrxAndRelatedOptions = {},
  ): Promise<T> {
    try {
      const ModelClass = this as typeof BaseModel & { new (): T }
      const { trx, related } = options

      return useTransaction(
        async tr => {
          let queryBuilder = ModelClass.query(tr) as ModelQueryBuilder<T>

          if (related) {
            queryBuilder = queryBuilder.withGraphFetched(related)
          }

          const result: T = await queryBuilder.findById(id).throwIfNotFound()
          return result
        },
        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: findById failed', e)
      throw e
    }
  }

  static async findOne<T extends BaseModel>(
    // this: { new (): T } & typeof BaseModel,
    this: new () => T,
    data: PartialModelObject<T>,
    options: TrxAndRelatedOptions = {},
  ): Promise<T> {
    try {
      const ModelClass = this as typeof BaseModel & { new (): T }
      const { trx, related } = options

      return useTransaction(
        async tr => {
          let queryBuilder = ModelClass.query(tr) as ModelQueryBuilder<T>

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
      throw e
    }
  }

  static async insert<T extends BaseModel>(
    this: new () => T,
    data: PartialModelObject<T>,
    options?: TrxAndRelatedOptions,
  ): Promise<T>

  static async insert<T extends BaseModel>(
    this: new () => T,
    data: PartialModelObject<T>[],
    options?: TrxAndRelatedOptions,
  ): Promise<T[]>

  static async insert<T extends BaseModel>(
    // this: { new (): T } & typeof BaseModel,
    this: new () => T,
    data: PartialModelObject<T> | PartialModelObject<T>[],
    options: TrxAndRelatedOptions = {},
  ): Promise<T | T[]> {
    try {
      const ModelClass = this as typeof BaseModel & { new (): T }
      const { trx, related } = options

      return useTransaction(
        async tr => {
          let queryBuilder = ModelClass.query(tr) as ModelQueryBuilder<T>

          if (related) {
            queryBuilder = queryBuilder.withGraphFetched(related)
          }

          if (Array.isArray(data)) {
            const res = await queryBuilder.insert(
              data as PartialModelObject<T>[],
            )
            return res
          }

          const res = await queryBuilder.insert(data as PartialModelObject<T>)
          return res
        },
        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: insert failed', e)
      throw e
    }
  }

  // INSTANCE METHOD
  async patch(
    data: PartialModelObject<this>,
    options: TrxOption = {},
  ): Promise<this> {
    try {
      const { trx } = options

      if (!data) {
        throw new Error('Patch is empty')
      }

      return useTransaction(
        async tr => {
          const q = this.$query(tr) as ModelSingleResult<this>
          const result = await q.patchAndFetch(data)
          return result
        },
        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: patch failed', e)
      throw e
    }
  }

  static async patchAndFetchById<T extends BaseModel>(
    // this: { new (): T } & typeof BaseModel,
    this: new () => T,
    id: string,
    data: PartialModelObject<T>,
    options: TrxAndRelatedOptions = {},
  ): Promise<T> {
    try {
      const { trx, related } = options
      const ModelClass = this as typeof BaseModel & { new (): T }

      return useTransaction(
        async tr => {
          let queryBuilder = ModelClass.query(tr) as ModelQueryBuilder<T>

          if (related) {
            queryBuilder = queryBuilder.withGraphFetched(related)
          }

          const result: T = await queryBuilder
            .patchAndFetchById(id, data)
            .throwIfNotFound()

          return result
        },
        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: patchAndFetchById failed', e)
      throw e
    }
  }

  // INSTANCE METHOD
  async update(
    data: PartialModelObject<this>,
    options: TrxOption = {},
  ): Promise<this> {
    try {
      const { trx } = options

      if (!data) {
        throw new Error('Patch is empty')
      }

      return useTransaction(
        async tr => {
          const q = this.$query(tr) as ModelSingleResult<this>
          const result = await q.updateAndFetch(data)
          return result
        },
        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: update failed', e)
      throw e
    }
  }

  static async updateAndFetchById<T extends BaseModel>(
    // this: { new (): T } & typeof BaseModel,
    this: new () => T,
    id: string,
    data: PartialModelObject<T>,
    options: TrxAndRelatedOptions = {},
  ): Promise<T> {
    try {
      const ModelClass = this as typeof BaseModel & { new (): T }
      const { trx, related } = options

      return useTransaction(
        async tr => {
          let queryBuilder = ModelClass.query(tr) as ModelQueryBuilder<T>

          if (related) {
            queryBuilder = queryBuilder.withGraphFetched(related)
          }

          const result: T = await queryBuilder
            .updateAndFetchById(id, data)
            .throwIfNotFound()

          return result
        },
        {
          trx,
          passedTrxOnly: true,
        },
      )
    } catch (e) {
      logger.error('Base model: updateAndFetchById failed', e)
      throw e
    }
  }

  static async deleteById<T extends BaseModel>(
    // this: { new (): T } & typeof BaseModel,
    this: new () => T,
    id: string,
    options: TrxOption = {},
  ): Promise<number> {
    try {
      const ModelClass = this as typeof BaseModel & { new (): T }

      const res = await ModelClass.query(options.trx)
        .deleteById(id)
        .throwIfNotFound()

      return res
    } catch (e) {
      logger.error(`${this.name} model: deleteById failed.`, e)
      throw e
    }
  }

  static async deleteByIds<T extends BaseModel>(
    // this: { new (): T } & typeof BaseModel,
    this: new () => T,
    ids: string[],
    options: TrxOption = {},
  ): Promise<number> {
    try {
      const ModelClass = this as typeof BaseModel & { new (): T }
      const rows = await ModelClass.query(options.trx).findByIds(ids)

      if (rows.length < ids.length) {
        const diff = ids.filter(id => !rows.map(res => res.id).includes(id))

        throw new Error(
          `id${diff.length > 1 ? 's' : ''} ${diff.join(', ')} not found`,
        )
      }

      const result = await ModelClass.query(options.trx)
        .delete()
        .whereIn('id', ids)
        .returning('id')

      return result.length
    } catch (e) {
      logger.error(`${this.name} model: deleteByIds failed`, e)
      throw e
    }
  }
}

BaseModel.pickJsonSchemaProperties = false

export default BaseModel
