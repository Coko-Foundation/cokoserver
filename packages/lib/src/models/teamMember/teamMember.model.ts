import { RelationMappings } from 'objection'
import BaseModel from '../base.model'
import { stringNullable, id } from '../_helpers/types'
import Team from '../team/team.model'
import User from '../user/user.model'

class TeamMember extends BaseModel {
  userId!: string
  teamId!: string
  status!: string
  user!: User
  team!: Team

  static get tableName(): string {
    return 'team_members'
  }

  static get schema(): object {
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

  static get relationMappings(): RelationMappings {
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
