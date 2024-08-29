const fs = require('fs')
const path = require('path')
const model = require('./chatChannel.model')
const chatChannelResolvers = require('./chatChannel.resolvers')

module.exports = {
  model,
  modelName: 'ChatChannel',
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'chatChannel.graphql'),
    'utf-8',
  ),
  resolvers: chatChannelResolvers,
}
