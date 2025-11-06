import User from '../user/user.model'

const usersResolver = async teamMember => {
  const { userId } = teamMember
  return User.findById(userId)
}

const resolvers = {
  TeamMember: {
    user: usersResolver,
  },
}

export default resolvers
