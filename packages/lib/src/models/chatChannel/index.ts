import fs from 'fs'
import path from 'path'
import model from './chatChannel.model'
import chatChannelResolvers from './chatChannel.resolvers'

export default {
  model,
  modelName: 'ChatChannel',
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'chatChannel.graphql'),
    'utf-8',
  ),
  resolvers: chatChannelResolvers,
}
