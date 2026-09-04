import fs from 'fs'
import path from 'path'
import model from './user.model'
import { usersBasedOnTeamMemberIdsLoader } from './user.loaders'
import userResolvers from './user.resolvers'

export default {
  model,
  modelName: 'User',
  modelLoaders: { usersBasedOnTeamMemberIdsLoader },
  typeDefs: fs.readFileSync(path.join(__dirname, 'user.graphql'), 'utf-8'),
  resolvers: userResolvers,
}
