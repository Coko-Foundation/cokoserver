import fs from 'fs'
import path from 'path'
import model from './teamMember.model'
import teamMemberResolvers from './teamMember.resolvers'

import { teamMembersBasedOnTeamIdsLoader } from './teamMember.loaders'

export default {
  model,
  modelName: 'TeamMember',
  modelLoaders: { teamMembersBasedOnTeamIdsLoader },
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'teamMember.graphql'),
    'utf-8',
  ),
  resolvers: teamMemberResolvers,
}
