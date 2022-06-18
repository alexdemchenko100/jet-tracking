
import { SettingsService } from '../services/SettingsService'
import { FastifyInstance } from 'fastify'
import S from 'fluent-json-schema'
import { NotificationSchema, NotificationChannel } from '@httpmon/db'

export default async function SettingsRouter(app: FastifyInstance) {
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

}
