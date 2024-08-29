const fs = require('fs')
const path = require('path')
const model = require('./chatMessage.model')
const { messagesBasedOnChatChannelIdsLoader } = require('./chatMessage.loaders')
const chatMessageResolvers = require('./chatMessage.resolvers')

module.exports = {
  model,
  modelName: 'ChatMessage',
  modelLoaders: {
    messagesBasedOnChatChannelIdsLoader,
  },
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'chatMessage.graphql'),
    'utf-8',
  ),
  resolvers: chatMessageResolvers,
}
