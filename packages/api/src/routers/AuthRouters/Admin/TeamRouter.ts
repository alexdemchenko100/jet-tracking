import { FastifyInstance } from 'fastify'
import S from 'fluent-json-schema'
import { UserAccountSchema } from '@httpmon/db'
import {
  Params,
  ParamsSchema,
  UserInviteSchema,
  UserInvite,
  UserUpdate,
  UserUpdateSchema,
} from '../../../types'
import { onAdminRequestAuthHook, onRequestAuthHook } from '../../RouterHooks'
import { TeamService } from '../../../services/TeamService'

export default async function TeamRouter(app: FastifyInstance) {
  app.addHook('onRequest', onRequestAuthHook)
  app.addHook('onRequest', onAdminRequestAuthHook)

  const teamService = TeamService.getInstance()

  // GET /team
  app.get(
    '/',
    {
      schema: {
        response: {
          200: S.array().items(UserAccountSchema),
        },
      },
    },
    async function (_, reply) {
      const resp = await teamService.listTeamMembers()
      reply.send(resp)
    }
  )

  // POST /team
  // Invite a new user to the team
  app.post<{ Body: UserInvite }>(
    '/',
    {
      schema: {
        body: UserInviteSchema,
      },
    },
    async function (req, reply) {
      const data = req.body

      const resp = await teamService.createOrUpdateTeamMember(data)
      reply.send(resp)
    }
  )

  // DELETE /team/:id
  app.delete<{ Params: Params }>(
    '/:id',
    {
      schema: {
        params: ParamsSchema,
      },
    },
    async function (req, reply) {
      const { id } = req.params

      const resp = await teamService.deleteTeamMember(id)
      req.log.info(`Delete user: ${JSON.stringify(resp)}`)
      reply.send(resp)
    }
  )

  // PUT /team/:id
  app.put<{ Body: UserUpdate; Params: Params }>(
    '/:id',
    {
      schema: {
        params: ParamsSchema,
        body: UserUpdateSchema,
      },
    },
    async function (req, reply) {
      const data = req.body
      const { id } = req.params
      const resp = await teamService.updateUser(id, data)
      req.log.info(`Updating user profile: ${JSON.stringify(resp)}`)
      reply.send(resp)
    }
  )
}
