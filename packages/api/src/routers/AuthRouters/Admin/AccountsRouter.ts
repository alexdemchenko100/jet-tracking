import { FastifyInstance } from 'fastify'
import S from 'fluent-json-schema'
import { UserAccountSchema } from '@httpmon/db'
import { onRequestAuthHook } from '../../RouterHooks'
import { getTeamMembers, setPrimaryTeamMember } from 'src/services/AccountsService'

export default async function SettingsRouter(app: FastifyInstance) {
  app.addHook('onRequest', onRequestAuthHook)

  interface SetDefaultTeams {
    accountId: string
    email: string
  }

  // GET /accounts
  app.get(
    '/accounts',
    {
      schema: {
        response: {
          200: S.array().items(UserAccountSchema),
        },
      },
    },
    async function ({}, reply) {
      const resp = await getTeamMembers()
      reply.send(resp)
    }
  )

  // POST /accounts/primary
  app.post<{ Body: SetDefaultTeams }>(
    '/accounts/primary',
    {},
    async function ({ body: { accountId } }, reply) {
      const resp = await setPrimaryTeamMember(accountId)
      reply.send(resp)
    }
  )
}
