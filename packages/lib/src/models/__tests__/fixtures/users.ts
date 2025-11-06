export const user = {
  type: 'user',
  username: 'testuser',
  password: 'test1234',
}

export const userWithInvalidPassword = {
  type: 'user',
  username: 'testuser',
  password: '1234',
}

export const userWithFullName = {
  type: 'user',
  username: 'testuser',
  password: 'test1234',
  givenNames: 'Sam',
  surname: 'Something',
}

export const userWithoutName = {
  type: 'user',
  password: 'test1234',
}

export const updatedUser = {
  username: 'changeduser',
  password: 'changed',
}

export const otherUser = {
  type: 'user',
  username: 'anotheruser',
  password: 'rubgy9876',
}
