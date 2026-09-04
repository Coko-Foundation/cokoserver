import fs from 'fs'
import path from 'path'
import chatGPTResolvers from './chatGPT.resolvers'

export const typeDefs = fs.readFileSync(
  path.join(__dirname, 'chatGPT.graphql'),
  'utf-8',
)

export const resolvers = chatGPTResolvers
