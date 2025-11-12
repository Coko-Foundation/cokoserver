import User from '../user/user.model'

const usersResolver = async (teamMember): Promise<User> => {
  const { userId } = teamMember
  return User.findById(userId)
}

const resolvers = {
  TeamMember: {
    user: usersResolver,
  },
}

export default resolvers
