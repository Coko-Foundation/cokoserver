import fs from 'fs'
import path from 'path'
import model from './team.model'
import teamResolvers from './team.resolvers'

export default {
  model,
  modelName: 'Team',
  typeDefs: fs.readFileSync(path.join(__dirname, 'team.graphql'), 'utf-8'),
  resolvers: teamResolvers,
}
