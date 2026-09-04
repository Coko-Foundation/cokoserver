import chatGPT from './chatGPT.controllers'

const chatGPTResolver = async (_, { input }): Promise<string> => {
  return chatGPT(input)
}

const resolvers = {
  Query: {
    chatGPT: chatGPTResolver,
  },
}

export default resolvers
