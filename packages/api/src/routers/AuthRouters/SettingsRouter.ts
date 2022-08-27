import { FastifyInstance } from 'fastify'
import S from 'fluent-json-schema'
import { UserAccountSchema } from '@httpmon/db'
import { onRequestAuthHook } from '../RouterHooks'
import { SettingsService } from '../../services/SettingsService'

export default async function SettingsRouter(app: FastifyInstance) {
  app.addHook('onRequest', onRequestAuthHook)

  const settingsService = SettingsService.getInstance()

  interface TeamsParams {
    email: string
  }

  interface SetDefaultTeams {
    accountId: string
    email: string
  }

  // GET /users/:email/teams
  app.get<{ Params: TeamsParams }>(
    '/users/:email/teams',
    {
      schema: {
        response: {
          200: S.array().items(UserAccountSchema),
        },
      },
    },
    async function ({ params: { email } }, reply) {
      const resp = await settingsService.getTeams(email)
      reply.send(resp)
    }
  )

  // POST /teams/default
  app.post<{ Body: SetDefaultTeams }>(
    '/teams/default',
    {},
    async function ({ body: { accountId, email } }, reply) {
      const resp = await settingsService.changeDefaultTeam(accountId, email)
      reply.send(resp)
    }
  )
}
