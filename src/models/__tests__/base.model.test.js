const { v4: uuid } = require('uuid')

const Fake = require('./helpers/fake/fake.model')
const { createUser } = require('./helpers/users')
const clearDb = require('./_clearDb')

describe('Base model', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
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
    await expect(Fake.find(1)).rejects.toThrow()
  })

  it('fetches one entity by provided id', async () => {
    const newEntity = await Fake.insert({})

    const entity = await Fake.findById(newEntity.id)
    expect(entity).toBeDefined()
  })

  it('throws when invalid params in findById', async () => {
    await expect(Fake.findById(false)).rejects.toThrow()
  })

  it('throws when id does not exist', async () => {
    await expect(Fake.findById(1)).rejects.toThrow()
  })

  it('fetches one entity', async () => {
    const newEntity = await Fake.insert({})

    const entity = await Fake.findOne(newEntity)
    expect(entity).toBeDefined()
  })

  it('throws when invalid params in findOne', async () => {
    await expect(Fake.findOne(1)).rejects.toThrow()
  })

  it('patches entity with provided data', async () => {
    const newEntity = await Fake.insert({})
    const affectedRows = await newEntity.patch({ status: 'test' })
    const patchedEntity = await Fake.findById(newEntity.id)
    expect(affectedRows).toEqual(1)
    expect(patchedEntity.status).toEqual('test')
  })

  it('throws when patch called with invalid params', async () => {
    const newEntity = await Fake.insert({})
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
    await expect(Fake.patchAndFetchById()).rejects.toThrow()
  })

  it('updates entity with provided data', async () => {
    const newEntity = await Fake.insert({})
    const affectedRows = await newEntity.update({ status: 'test' })
    const updatedEntity = await Fake.findById(newEntity.id)
    expect(affectedRows).toEqual(1)
    expect(updatedEntity.status).toEqual('test')
  })

  it('throws when update called with invalid params', async () => {
    const newEntity = await Fake.insert({})
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
    await expect(Fake.deleteById()).rejects.toThrow()
  })

  it('deletes multiple entities based on ids', async () => {
    const newEntity1 = await Fake.insert({})
    const newEntity2 = await Fake.insert({})
    const affectedRows = await Fake.deleteByIds([newEntity1.id, newEntity2.id])
    const { result } = await Fake.find({})
    expect(affectedRows).toEqual([newEntity1.id, newEntity2.id])
    expect(result).toHaveLength(0)
  })

  it('throws when an id in deleteByIds does not exist', async () => {
    const entity1 = await Fake.insert({
      status: 'a',
    })

    await expect(Fake.deleteByIds([entity1.id, uuid()])).rejects.toThrow()
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
