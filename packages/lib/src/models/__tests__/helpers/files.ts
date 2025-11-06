import { File } from '../../index'

const createFilesForObjectId = async (objectId, objectType) => {
  try {
    const res = []

    const file1 = await File.query().insert({
      name: '1.txt',
      storedObjects: [
        {
          type: 'original',
          mimetype: 'text/plain',
          extension: 'txt',
          key: 'asdfasdfasdf',
          imageMetadata: { width: 232323, height: 2323 },
          size: 25,
        },
      ],
      objectId,
    })

    const file2 = await File.query().insert({
      name: '2.txt',
      storedObjects: [
        {
          id: objectId,
          type: 'original',
          mimetype: 'text/plain',
          key: 'asdfasdfasdf',
          extension: 'txt',
          imageMetadata: { width: 232323, height: 2323, id: objectId },
          size: 25,
        },
      ],
      objectId,
    })

    res.push(file1)
    res.push(file2)

    return res
  } catch (e) {
    throw new Error(e)
  }
}

export { createFilesForObjectId }
