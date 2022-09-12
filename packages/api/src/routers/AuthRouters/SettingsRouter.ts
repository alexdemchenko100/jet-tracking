import { FastifyInstance } from 'fastify'
import S from 'fluent-json-schema'
import { UserAccountSchema, UIStateSchema, UIState } from '@httpmon/db'
import { onRequestAuthHook } from '../RouterHooks'
import { SettingsService } from '../../services/SettingsService'

export default async function SettingsRouter(app: FastifyInstance) {
  app.addHook('onRequest', onRequestAuthHook)

  const settingsService = SettingsService.getInstance()

  interface SetDefaultTeams {
    accountId: string
    email: string
  }

  // GET /users/:email/teams
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
      const resp = await settingsService.getTeams()
      reply.send(resp)
    }
  )

  // POST /teams/default
  app.post<{ Body: SetDefaultTeams }>(
    '/accounts/default',
    {},
    async function ({ body: { accountId } }, reply) {
      const resp = await settingsService.changeDefaultTeam(accountId)
      reply.send(resp)
    }
  )

  interface SetUIState {
    uiState: UIState
  }

  const SetUIStateSchema = S.object().prop('uiState', UIStateSchema)

  // GET /users/:email/ui-state
  app.get(
    '/ui-state',
    {
      schema: {
        response: {
          200: SetUIStateSchema,
        },
      },
    },
    async function ({}, reply) {
      const resp = await settingsService.getUIStateSetting()
      reply.send({ uiState: resp })
    }
  )

  // PUT /users/:email/ui-state
  app.put<{ Body: SetUIState }>(
    '/ui-state',
    {
      schema: {
        body: SetUIStateSchema,
        response: {
          200: SetUIStateSchema,
        },
      },
    },
    async function ({ body: { uiState } }, reply) {
      const resp = await settingsService.updateUIStateSetting(uiState)
      reply.send(resp)
    }
  )
}
