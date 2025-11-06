import BaseModel from '../base.model'
import { stringNullable, id } from '../_helpers/types'
import Team from '../team/team.model'
import User from '../user/user.model'

class TeamMember extends BaseModel {
  static get tableName() {
    return 'team_members'
  }

  static get schema() {
    return {
      type: 'object',
      required: ['teamId', 'userId'],
      properties: {
        userId: id,
        teamId: id,
        status: stringNullable,
      },
    }
  }

  static get relationMappings() {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'team_members.userId',
          to: 'users.id',
        },
      },
      team: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Team,
        join: {
          from: 'team_members.teamId',
          to: 'teams.id',
        },
      },
    }
  }
}

export default TeamMember
