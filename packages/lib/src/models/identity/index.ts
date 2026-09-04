import fs from 'fs'
import path from 'path'
import model from './identity.model'
import identityResolvers from './identity.resolvers'

import {
  identitiesBasedOnUserIdsLoader,
  defaultIdentityBasedOnUserIdsLoader,
} from './identity.loaders'

export default {
  model,
  modelName: 'Identity',
  modelLoaders: {
    identitiesBasedOnUserIdsLoader,
    defaultIdentityBasedOnUserIdsLoader,
  },
  resolvers: identityResolvers,
  typeDefs: fs.readFileSync(path.join(__dirname, 'identity.graphql'), 'utf-8'),
}
