const BaseModel = require('../base.model')
const { stringNullable, id } = require('../_helpers/types')

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
    /* eslint-disable global-require */
    const Team = require('../team/team.model')
    const User = require('../user/user.model')
    /* eslint-enable global-require */

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

module.exports = TeamMember
