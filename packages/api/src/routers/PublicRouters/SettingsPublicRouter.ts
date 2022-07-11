import { FastifyInstance } from 'fastify'
import { EmailVerification, EmailVerificationSchema } from '@httpmon/db'
import S from 'fluent-json-schema'
import { SettingsService } from '../../services/SettingsService'

export default async function SettingsPublicRouter(app: FastifyInstance) {
  const settingsService = SettingsService.getInstance()

  // POST /emails/verify
  app.post<{ Body: EmailVerification }>(
    '/emails/verify',
    {
      schema: {
        body: EmailVerificationSchema,
        response: {
          200: S.object().prop('message', S.string()),
        },
      },
    },
    async function (req, reply) {
      const { email, token } = req.body

      const resp = await settingsService.verifyEmail(email, token || '')
      reply.send({ message: resp })
    }
  )
}
