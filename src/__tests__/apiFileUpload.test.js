const fs = require('fs')
const path = require('path')
const { migrationManager } = require('../db')
const { User } = require('../models')

const api = require('./helpers/api')
const clearDb = require('../models/__tests__/_clearDb')
const authentication = require('../authentication')

function fileName(name) {
  return path.join(__dirname, 'fixtures', name)
}

function file(name) {
  return fs.createReadStream(fileName(name))
}

function fileBuffer(name) {
  return fs.readFileSync(fileName(name))
}

describe('File upload/download', () => {
  let token

  beforeAll(async () => {
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await clearDb()

    const user = await User.insert({
      type: 'user',
      username: 'testuser',
      password: 'password',
    })

    token = authentication.token.create(user)
  })

  afterAll(() => {
    const knex = User.knex()
    knex.destroy()
  })

  it('should upload a file and preserve the extension and serve the file (if authenticated)', async () => {
    const res = await api.upload.post(file('fixture.jpg'), token)
    expect(res.statusCode).toBe(200)
    expect(path.extname(res.text)).toBe('.jpg')

    const download = await api.upload.get(res.text, token)
    expect(download.body.equals(fileBuffer('fixture.jpg'))).toBe(true)
  })

  it('should serve a 404 if the file does not exist', async () => {
    const res = await api.upload.get('/uploads/nofilehere')
    expect(res.statusCode).toBe(404)
  })
})
