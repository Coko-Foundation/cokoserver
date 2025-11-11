import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { v4 as uuid } from 'uuid'

import Fake from './helpers/fake/fake.model'
import { createUser } from './helpers/users'
import clearDb from '../_helpers/clearDb'
import config from '../../configManager/config'
import { migrationManager } from '../../db'

describe('Base model', () => {
  beforeAll(async () => {
    config.reset()
    await config.init({
      components: ['src/models/user', 'src/models/__tests__/helpers/fake'],
    })

    await migrationManager.migrate()
  })

  beforeEach(async () => clearDb())

  afterAll(() => {
    config.reset()
    const knex = Fake.knex()
    knex.destroy()
  })

  it('creates an entity', async () => {
    const user = await createUser()

    const newFake = await Fake.insert({
      userId: user.id,
      status: 'test',
    })

    expect(newFake).toBeDefined()
  })

  it('throws when invalid params in insert', async () => {
    // @ts-ignore
    await expect(Fake.insert(1)).rejects.toThrow()
  })

  it('fetches all entities', async () => {
    const user = await createUser()

    await Fake.insert({
      userId: user.id,
      status: 'test',
    })

    const { result } = await Fake.find({})

    expect(result).toHaveLength(1)
  })

  it('fetches all entities with relations', async () => {
    const user = await createUser()

    await Fake.insert({
      userId: user.id,
      status: 'test',
    })

    const { result } = await Fake.find({}, { related: 'user' })
    expect(result[0].user.id).toEqual(user.id)
  })

  it('fetches all orderedBy status', async () => {
    const user = await createUser()

    await Fake.insert({
      userId: user.id,
      status: 'a',
    })
    await Fake.insert({
      userId: user.id,
      status: 'b',
    })

    const { result } = await Fake.find(
      {},
      { orderBy: [{ column: 'status', order: 'desc' }] },
    )

    expect(result[0].status).toEqual('b')
    expect(result[1].status).toEqual('a')
  })

  it('fetches limited amount of entities', async () => {
    await Fake.insert({
      status: 'a',
    })
    await Fake.insert({
      status: 'b',
    })
    await Fake.insert({
      status: 'd',
    })

    const { result } = await Fake.find({}, { page: 0, pageSize: 2 })
    expect(result).toHaveLength(2)
  })

  it('skips two and fetches two entities', async () => {
    await Fake.insert({
      status: 'a',
    })
    await Fake.insert({
      status: 'b',
    })
    await Fake.insert({
      status: 'c',
    })
    await Fake.insert({
      status: 'd',
    })

    const { result } = await Fake.find({}, { page: 1, pageSize: 2 })
    expect(result).toHaveLength(2)
    expect(result[0].status).toEqual('c')
    expect(result[1].status).toEqual('d')
  })

  it('skips two and fetches two entities with total count', async () => {
    await Fake.insert({
      status: 'a',
    })
    await Fake.insert({
      status: 'b',
    })
    await Fake.insert({
      status: 'c',
    })
    await Fake.insert({
      status: 'd',
    })

    const { result, totalCount } = await Fake.find({}, { page: 1, pageSize: 2 })
    expect(totalCount).toEqual(4)
    expect(result).toHaveLength(2)
    expect(result[0].status).toEqual('c')
    expect(result[1].status).toEqual('d')
  })

  it('fetches entities by their ids', async () => {
    const entity1 = await Fake.insert({
      status: 'a',
    })

    const entity2 = await Fake.insert({
      status: 'b',
    })

    const entity3 = await Fake.insert({
      status: 'c',
    })

    const entity4 = await Fake.insert({
      status: 'd',
    })

    const res = await Fake.findByIds([
      entity1.id,
      entity2.id,
      entity3.id,
      entity4.id,
    ])

    expect(res).toHaveLength(4)
    expect(res[0].status).toEqual('a')
    expect(res[1].status).toEqual('b')
    expect(res[2].status).toEqual('c')
    expect(res[3].status).toEqual('d')
  })

  it('throws when an id in findById does not exist', async () => {
    const entity1 = await Fake.insert({
      status: 'a',
    })

    await expect(Fake.findByIds([entity1.id, uuid()])).rejects.toThrow()
  })

  it('throws when invalid params in find', async () => {
    // @ts-ignore
    await expect(Fake.find(1)).rejects.toThrow()
  })

  it('fetches one entity by provided id', async () => {
    const newEntity = await Fake.insert({})

    const entity = await Fake.findById(newEntity.id)
    expect(entity).toBeDefined()
  })

  it('throws when invalid params in findById', async () => {
    // @ts-ignore
    await expect(Fake.findById(false)).rejects.toThrow()
  })

  it('throws when id does not exist', async () => {
    // @ts-ignore
    await expect(Fake.findById(1)).rejects.toThrow()
  })

  it('fetches one entity', async () => {
    const newEntity = await Fake.insert({})

    const entity = await Fake.findOne(newEntity)
    expect(entity).toBeDefined()
  })

  it('throws when invalid params in findOne', async () => {
    // @ts-ignore
    await expect(Fake.findOne(1)).rejects.toThrow()
  })

  it('patches entity with provided data', async () => {
    const newEntity = await Fake.insert({})
    const result = await newEntity.patch({ status: 'test' })
    expect(result).toBeDefined()
    expect(result.status).toEqual('test')
  })

  it('throws when patch called with invalid params', async () => {
    const newEntity = await Fake.insert({})
    // @ts-ignore
    await expect(newEntity.patch()).rejects.toThrow()
  })

  it('patches and fetches entity by providing id along with provided data', async () => {
    const newEntity = await Fake.insert({})

    const patchedEntity = await Fake.patchAndFetchById(newEntity.id, {
      status: 'test',
    })

    expect(patchedEntity.status).toEqual('test')
  })

  it('patches and fetches entity by providing id along with provided data as well as fetches related entities', async () => {
    const user = await createUser()
    const newEntity = await Fake.insert({})

    const patchedEntity = await Fake.patchAndFetchById(
      newEntity.id,
      {
        status: 'test',
        userId: user.id,
      },
      { related: 'user' },
    )

    expect(patchedEntity.user).toBeDefined()
    expect(patchedEntity.user.id).toEqual(user.id)
  })

  it('throws when patchAndFetchById called with invalid params', async () => {
    // @ts-ignore
    await expect(Fake.patchAndFetchById()).rejects.toThrow()
  })

  it('updates entity with provided data', async () => {
    const newEntity = await Fake.insert({})
    const result = await newEntity.update({ status: 'test' })

    expect(result).toBeDefined()
    expect(result.status).toEqual('test')
  })

  it('throws when update called with invalid params', async () => {
    const newEntity = await Fake.insert({})
    // @ts-ignore
    await expect(newEntity.update()).rejects.toThrow()
  })

  it('updates and fetches entity by providing id along with provided data', async () => {
    const newEntity = await Fake.insert({})

    const patchedEntity = await Fake.updateAndFetchById(newEntity.id, {
      status: 'test',
    })

    expect(patchedEntity.status).toEqual('test')
  })

  it('updates and fetches entity by providing id along with provided data as well as fetches related entities', async () => {
    const user = await createUser()
    const newEntity = await Fake.insert({})

    const patchedEntity = await Fake.updateAndFetchById(
      newEntity.id,
      {
        status: 'test',
        userId: user.id,
      },
      { related: 'user' },
    )

    expect(patchedEntity.user).toBeDefined()
    expect(patchedEntity.user.id).toEqual(user.id)
  })

  it('throws when updateAndFetchById called with invalid params', async () => {
    // @ts-ignore
    await expect(Fake.updateAndFetchById()).rejects.toThrow()
  })

  it('deletes entities based on id', async () => {
    const newEntity = await Fake.insert({})
    const affectedRows = await Fake.deleteById(newEntity.id)
    const { result } = await Fake.find({})
    expect(affectedRows).toEqual(1)
    expect(result).toHaveLength(0)
  })

  it('throws when deleteById called with invalid params', async () => {
    // @ts-ignore
    await expect(Fake.deleteById()).rejects.toThrow()
  })

  it('deletes multiple entities based on ids', async () => {
    const newEntity1 = await Fake.insert({})
    const newEntity2 = await Fake.insert({})
    const affectedRows = await Fake.deleteByIds([newEntity1.id, newEntity2.id])
    const { result } = await Fake.find({})
    expect(affectedRows).toEqual(2)
    expect(result).toHaveLength(0)
  })

  it('throws when an id in deleteByIds does not exist', async () => {
    const entity1 = await Fake.insert({
      status: 'a',
    })

    await expect(Fake.deleteByIds([entity1.id, uuid()])).rejects.toThrow()

    const fakes = await Fake.find({})
    expect(fakes.totalCount).toBe(1)
  })

  it('has updated set when created', async () => {
    const entity = await Fake.insert({})
    expect(entity.updated).toEqual(entity.created)
  })

  it('updates updated field when an update is executed', async () => {
    const entity = await Fake.insert({})

    const updatedEntity = await Fake.patchAndFetchById(entity.id, {
      status: 'new',
    })

    expect(new Date(updatedEntity.updated).getTime()).toBeGreaterThan(
      new Date(entity.created).getTime(),
    )
  })
})
