import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { v4 as uuid } from 'uuid'
import { File } from '../../index'
import { createFilesForObjectId } from '../../__tests__/helpers/files'

import config from '../../../configManager/config'
import { migrationManager } from '../../../db'
import DbTestUtils from '../../../db/DbTestUtils'

describe('File model', () => {
  beforeAll(async () => {
    config.reset()
    await config.init({
      components: ['src/models/file'],
    })

    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
  })

  afterAll(() => {
    config.reset()
    const knex = File.knex()
    knex.destroy()
  })

  it('fetches all files of given objectId', async () => {
    const objectId = uuid()
    const files = await createFilesForObjectId(objectId)
    const dbFiles = await File.getEntityFiles(objectId)

    expect(dbFiles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: files[0].id }),
        expect.objectContaining({ id: files[1].id }),
      ]),
    )
  })

  it('gets specified storedObject based on type', async () => {
    const objectId = uuid()
    await createFilesForObjectId(objectId)
    const dbFiles = await File.getEntityFiles(objectId)

    expect(dbFiles[0].getStoredObjectBasedOnType('original').type).toEqual(
      'original',
    )
  })

  it('throws when specified storedObject type is unknown', async () => {
    const objectId = uuid()
    await createFilesForObjectId(objectId)
    const dbFiles = await File.getEntityFiles(objectId)

    expect(() => dbFiles[0].getStoredObjectBasedOnType('unknown')).toThrow(
      'Unknown type of stored object provided',
    )
  })

  it('creates ids for storedObjects and imageMetadata when not declared', async () => {
    const objectId = uuid()
    const files = await createFilesForObjectId(objectId)

    expect(files[0].storedObjects[0].id).toBeDefined()
    expect(files[0].storedObjects[0].imageMetadata?.id).toBeDefined()
  })

  it('does not create ids for storedObjects and imageMetadata when exist', async () => {
    const objectId = uuid()
    const files = await createFilesForObjectId(objectId)

    expect(files[1].storedObjects[0].id).toEqual(objectId)
    expect(files[1].storedObjects[0].imageMetadata?.id).toEqual(objectId)
  })
})
