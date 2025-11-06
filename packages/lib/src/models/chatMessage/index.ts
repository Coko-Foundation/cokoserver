import fs from 'fs'
import path from 'path'
import model from './chatMessage.model'
import { messagesBasedOnChatChannelIdsLoader } from './chatMessage.loaders'
import chatMessageResolvers from './chatMessage.resolvers'

export default {
  model,
  modelName: 'ChatMessage',
  modelLoaders: { messagesBasedOnChatChannelIdsLoader },
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'chatMessage.graphql'),
    'utf-8',
  ),
  resolvers: chatMessageResolvers,
}
