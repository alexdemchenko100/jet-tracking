import { FastifyInstance } from 'fastify'
import { SettingsSchema, Settings } from '@httpmon/db'
import { Params, ParamsSchema } from '../../../types'
import { onAdminRequestAuthHook, onRequestAuthHook } from '../../RouterHooks'
import { SettingsService } from '../../../services/SettingsService'
import { currentUserInfo } from '../../../Context'

export default async function SettingsRouter(app: FastifyInstance) {
  app.addHook('onRequest', onRequestAuthHook)
  app.addHook('onRequest', onAdminRequestAuthHook)

  const settingsService = SettingsService.getInstance()

  // GET /
  app.get(
    '/',
    {
      schema: {
        response: {
          200: SettingsSchema,
        },
      },
    },
    async function (req, reply) {
      if (currentUserInfo().role === 'viewer') {
        reply.status(403).send()
      }
      const resp = await settingsService.getSettings()
      req.log.info(`Get settings: ${JSON.stringify(resp)}`)
      reply.send(resp)
    }
  )

  // PUT /
  app.put<{ Body: Settings; Params: Params }>(
    '/',
    {
      schema: {
        params: ParamsSchema,
        body: SettingsSchema,
        response: {
          200: SettingsSchema,
        },
      },
    },
    async function (req, reply) {
      const data = req.body
      const resp = await settingsService.updateSettings(data)
      req.log.info(`Updating settings: ${JSON.stringify(resp)}`)
      reply.send(resp)
    }
  )
}
