import { TeamService } from './../../services/TeamService'
import { FastifyInstance } from 'fastify'
import { EmailVerification, EmailVerificationSchema } from '@httpmon/db'
import S from 'fluent-json-schema'
import { SettingsService } from '../../services/SettingsService'
import { UserVerification, UserVerificationSchema } from '../../types'

export default async function SettingsPublicRouter(app: FastifyInstance) {
  const settingsService = SettingsService.getInstance()
  const teamService = TeamService.getInstance()

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

      const resp = await teamService.verifyToken(email, token || '')
      reply.send({ message: resp.status })
    }
  )

  // POST /users/verify
  app.post<{ Body: UserVerification }>(
    '/users/verify',
    {
      schema: {
        body: UserVerificationSchema,
        response: {
          200: S.object().prop('status', S.string()).prop('hasDefaultUser', S.boolean()),
        },
      },
    },
    async function (req, reply) {
      const { email, token, accountId } = req.body

      const resp = await teamService.verifyToken(email, token || '')
      reply.send(resp)
    }
  )
}
