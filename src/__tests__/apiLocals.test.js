const api = require('../app')(require('express')())

const db = require('../dbManager/db')
const clearDb = require('../models/__tests__/_clearDb')
const { User } = require('../models')

const userData = {
  type: 'user',
  username: 'testuser',
  password: 'password',
}

describe('api/app locals', () => {
  beforeEach(async () => {
    await clearDb()

    return User.insert(userData)
  })

  afterAll(() => {
    db.destroy()
  })

  it('exposes models', async () => {
    const userInstance = new api.locals.models.User()
    expect(userInstance.type).toEqual('user')

    const teamInstance = new api.locals.models.Team()
    expect(teamInstance.type).toEqual('team')

    const user = await api.locals.models.User.findOne({
      username: userData.username,
    })

    expect(user.username).toEqual(userData.username)
  })
})
