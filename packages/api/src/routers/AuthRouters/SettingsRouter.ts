import { FastifyInstance } from 'fastify'
import S from 'fluent-json-schema'
import { UIStateSchema, UIState, NotificationChannel, NotificationSchema } from '@httpmon/db'
import { onRequestAuthHook } from '../RouterHooks'
import { SettingsService } from '../../services/SettingsService'
import { currentUserInfo } from 'src/Context'
import { Params, ParamsSchema } from 'src/types'

export default async function SettingsRouter(app: FastifyInstance) {
  app.addHook('onRequest', onRequestAuthHook)

  const settingsService = SettingsService.getInstance()

  // GET /notifications
  app.get(
    '/notifications',
    {
      schema: {
        response: {
          200: S.array().items(NotificationSchema),
        },
      },
    },
    async function (_, reply) {
      if (currentUserInfo().role === 'viewer') {
        reply.status(403).send()
      }
      const resp = await settingsService.listNotifications()
      reply.send(resp)
    }
  )

  // POST /notifications
  app.post<{ Body: NotificationChannel }>(
    '/notifications',
    {
      schema: {
        body: NotificationSchema,
        response: {
          201: NotificationSchema,
        },
      },
    },
    async function (req, reply) {
      const data = req.body

      const resp = await settingsService.saveNotifcation(data)
      req.log.info(`Creating new notification: ${resp?.id}`)
      reply.send(resp)
    }
  )

  // PUT /notifications/:id
  app.put<{ Body: NotificationChannel; Params: Params }>(
    '/notifications/:id',
    {
      schema: {
        params: ParamsSchema,
        body: NotificationSchema,
        response: {
          200: NotificationSchema,
        },
      },
    },
    async function (req, reply) {
      const data = req.body
      const { id } = req.params

      const resp = await settingsService.updateNotifcation(id, data)
      req.log.info(`Updating notification: ${JSON.stringify(resp)}`)
      reply.send(resp)
    }
  )

  // DELETE /notifications/:id
  app.delete<{ Params: Params }>(
    '/notifications/:id',
    {
      schema: {
        params: ParamsSchema,
        body: S.number(),
      },
    },
    async function ({ params: { id }, log }, reply) {
      const resp = await settingsService.deleteNotification(id)
      log.info(resp, `Deleted notification id: ${id}`)
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
