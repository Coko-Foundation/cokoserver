import { ValidationError, RelationMappings } from 'objection'

import logger from '../../logger'
import BaseModel from '../base.model'
import TeamMember from '../teamMember/teamMember.model'
import User from '../user/user.model'

import {
  booleanDefaultFalse,
  idNullable,
  stringNullable,
} from '../_helpers/types'

import config from '../../configManager/config'
import { type Teams } from '../../configManager/configSchema'

import useTransaction from '../useTransaction'

function createEnumFromConfig(teamsConfig: Teams, key: string): string[] {
  return Array.from(
    new Set(
      Object.values(teamsConfig)
        .flat()
        .map(t => t[key]),
    ),
  )
}

class Team extends BaseModel {
  constructor() {
    super()
    this.type = 'team'
  }

  static get tableName(): string {
    return 'teams'
  }

  static get relationMappings(): RelationMappings {
    return {
      members: {
        relation: BaseModel.HasManyRelation,
        modelClass: TeamMember,
        join: {
          from: 'teams.id',
          to: 'team_members.teamId',
        },
      },
      users: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'teams.id',
          through: {
            modelClass: TeamMember,
            from: 'team_members.teamId',
            to: 'team_members.userId',
          },
          to: 'users.id',
        },
      },
    }
  }

  static get schema(): object {
    const cfg = config.get('teams')
    const rolesEnum = createEnumFromConfig(cfg, 'role')
    const displayNamesEnum = createEnumFromConfig(cfg, 'displayName')

    return {
      type: 'object',
      required: ['role', 'displayName'],
      properties: {
        objectId: idNullable,
        objectType: stringNullable,
        displayName: {
          type: 'string',
          enum: displayNamesEnum,
        },
        role: {
          type: 'string',
          enum: rolesEnum,
        },
        global: booleanDefaultFalse,
      },
    }
  }

  /* eslint-disable-next-line class-methods-use-this */
  $beforeValidate(jsonSchema, json) {
    let validTeamChoice
    let validCombinationOfRoleAndName = true
    const { global, role, displayName } = json

    if (global) {
      const globalTeams = config.get('teams.global')
      validTeamChoice = globalTeams.find(t => t.role === role)

      if (displayName && validTeamChoice) {
        validCombinationOfRoleAndName =
          validTeamChoice.displayName === displayName
      }
    } else {
      const nonGlobalTeams = config.get('teams.nonGlobal')
      validTeamChoice = nonGlobalTeams.find(t => t.role === role)

      if (displayName && validTeamChoice) {
        validCombinationOfRoleAndName =
          validTeamChoice.displayName === displayName
      }
    }

    if (!validTeamChoice) {
      const errorMessage = `Role ${role} is not valid for ${
        global ? '' : 'non-'
      }global teams`

      throw new ValidationError({
        type: 'ModelValidation',
        message: errorMessage,
      })
    }

    if (!validCombinationOfRoleAndName) {
      const errorMessage = `Display name ${displayName} does not correspond to the provided role ${role} of ${
        global ? '' : 'non-'
      }global teams`

      throw new ValidationError({
        type: 'ModelValidation',
        message: errorMessage,
      })
    }

    return jsonSchema
  }

  static async findAllGlobalTeams(options = {}) {
    try {
      return useTransaction(
        async tr => {
          return this.query(tr).where({ global: true })
        },
        { trx: options.trx, passedTrxOnly: true },
      )
    } catch (e) {
      logger.error('Team model: findAllGlobalTeams failed', e)
      throw new Error(e)
    }
  }

  static async findGlobalTeamByRole(role, options = {}) {
    try {
      return useTransaction(
        async tr => {
          return this.query(tr).findOne({
            role,
            global: true,
          })
        },
        { trx: options.trx, passedTrxOnly: true },
      )
    } catch (e) {
      logger.error('Team model: findGlobalTeamByRole failed', e)
      throw new Error(e)
    }
  }

  static async findTeamByRoleAndObject(role, objectId, options = {}) {
    try {
      return useTransaction(
        async tr => {
          return this.query(tr).findOne({
            role,
            objectId,
          })
        },
        { trx: options.trx, passedTrxOnly: true },
      )
    } catch (e) {
      logger.error('Team model: findTeamByRoleAndObject failed', e)
      throw new Error(e)
    }
  }

  /**
   * Members should be an array of user ids
   */
  static async updateMembershipByTeamId(teamId, members, options = {}) {
    const queries = async trx => {
      const existingMembers = await TeamMember.query(trx).where({ teamId })
      const existingMemberUserIds = existingMembers.map(m => m.userId)

      // add members that exist in the incoming array, but not in the db
      const toAdd = members.filter(id => !existingMemberUserIds.includes(id))
      await Promise.all(
        toAdd.map(userId =>
          Team.addMember(teamId, userId, {
            trx,
            ...(options.status && { status: options.status }),
          }),
        ),
      )

      // delete members that exist in the db, but not in the incoming array
      const toDelete = existingMemberUserIds.filter(id => !members.includes(id))
      await Promise.all(
        toDelete.map(userId => Team.removeMember(teamId, userId, { trx })),
      )
      return Team.findById(teamId, { trx })
    }

    return useTransaction(queries, { trx: options.trx })
  }

  static async addMember(teamId, userId, options = {}) {
    const data = {
      teamId,
      userId,
    }

    if (options.status) data.status = options.status

    const add = async trx => {
      await TeamMember.query(trx).insert(data)
      return Team.findById(teamId, { trx })
    }

    const trxOptions = {
      trx: options.trx,
      passedTrxOnly: true,
    }

    try {
      return useTransaction(add, trxOptions)
    } catch (e) {
      logger.error('Team Model: Add member: Insert failed!')
      throw new Error(e)
    }
  }

  static async removeMember(teamId, userId, options = {}) {
    const remove = async trx => {
      await TeamMember.query(trx)
        .delete()
        .where({
          teamId,
          userId,
        })
        .throwIfNotFound()
      return Team.findById(teamId, { trx })
    }

    try {
      return useTransaction(remove, { trx: options.trx, passedTrxOnly: true })
    } catch (e) {
      logger.error(
        'Team model: Remove member: Transaction failed! Rolling back...',
      )
      throw new Error(e)
    }
  }

  static async addMemberToGlobalTeam(userId, role, options = {}) {
    try {
      const { trx } = options

      const team = await Team.findOne(
        {
          role,
          global: true,
        },
        { trx },
      )

      return Team.addMember(team.id, userId, options)
    } catch (e) {
      logger.error(`Team model: Add member to global team: ${e.message}`)
      throw new Error(e)
    }
  }

  static async removeMemberFromGlobalTeam(userId, role, options = {}) {
    try {
      const { trx } = options

      const team = await Team.findOne(
        {
          role,
          global: true,
        },
        { trx },
      )

      return Team.removeMember(team.id, userId, options)
    } catch (e) {
      logger.error(`Team model: Remove member from global team: ${e.message}`)
      throw new Error(e)
    }
  }
}

export default Team
