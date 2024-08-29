const { faker } = require('@faker-js/faker')

module.exports = {
  identityWithProfileData: {
    email: faker.internet.email(),
    isDefault: true,
    profileData: {
      displayName: 'Test User',
      identifier: 'ojndszf098u34lasf-90i',
      email: 'user@example.com',
    },
  },
}
