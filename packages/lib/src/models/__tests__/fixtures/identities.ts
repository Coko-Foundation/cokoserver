import { faker } from '@faker-js/faker'

const data = {
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

export default data
