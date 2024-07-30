/* eslint-disable jest/no-commented-out-tests */

const api = require('../helpers/api')
const authentication = require('../../authentication')
const { User } = require('../../models')
const clearDb = require('../../models/__tests__/_clearDb')
const { db } = require('../../db')

describe('GraphQL core mutations', () => {
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

  describe('mutations', () => {
    // it.skip('can create a user', async () => {
    //   const { body } = await api.graphql.query(
    //     `mutation($input: UserInput) {
    //       createUser(input: $input) { username }
    //     }`,
    //     {
    //       input: {
    //         username: 'floobs',
    //         email: 'nobody@example.com',
    //         password: 'password',
    //       },
    //     },
    //     token,
    //   )

    //   expect(body).toEqual({
    //     data: {
    //       createUser: { username: 'floobs' },
    //     },
    //   })
    // })

    it('can update a user', async () => {
      const { body } = await api.graphql.query(
        `mutation($id: ID, $input: UpdateInput!) {
          updateUser(id: $id, input: $input) { username }
        }`,
        {
          id: user.id,
          input: {
            username: 'floobs',
          },
        },
        token,
      )

      expect(body).toEqual({
        data: {
          updateUser: { username: 'floobs' },
        },
      })
    })

    it('can delete a user', async () => {
      const { body } = await api.graphql.query(
        `mutation($id: ID!) {
          deleteUser(id: $id)
        }`,
        { id: user.id },
        token,
      )

      expect(body).toEqual({
        data: { deleteUser: '1' },
      })
    })
  })
})
