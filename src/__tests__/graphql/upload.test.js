const api = require('../helpers/api')
const authentication = require('../../authentication')
const clearDb = require('../../models/__tests__/_clearDb')
const { User } = require('../../models')
const { db } = require('../../db')

describe('GraphQL uploads', () => {
  let token
  let user

  const userData = {
    username: 'testuser',
    password: 'password',
  }

  beforeEach(async () => {
    await clearDb()
    user = await User.insert(userData)
    token = authentication.token.create(user)
  })

  afterAll(() => {
    db.destroy()
  })

  it('can upload a file', async () => {
    const { body } = await api.request
      .post('/graphql')
      .field(
        'operations',
        JSON.stringify({
          operationName: null,
          variables: { file: null },
          query:
            'mutation ($file: Upload!) {\n  upload(file: $file) {\n    url\n    __typename\n  }\n}\n',
        }),
      )
      .field('map', JSON.stringify({ 0: ['variables.file'] }))
      .attach('0', Buffer.from('hello world'), 'hello.txt')
      .set('Authorization', `Bearer ${token}`)

    expect(body).toMatchObject({
      data: {
        upload: { url: expect.stringMatching(/^\/\w{32}\.txt$/) },
      },
    })
  })
})
