import { TeamService } from './../../services/TeamService'
import { FastifyInstance } from 'fastify'
import { EmailVerification, EmailVerificationSchema } from '@httpmon/db'
import S from 'fluent-json-schema'
import { SettingsService } from '../../services/SettingsService'
import { UserCreate, UserCreateSchema, UserVerification, UserVerificationSchema } from '../../types'

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

  // POST /users
  app.post<{ Body: UserCreate }>(
    '/users',
    {
      schema: {
        body: UserCreateSchema,
      },
    },
    async function (req, reply) {
      const { email, password, displayName } = req.body
      const resp = await settingsService.createUser(email, password, displayName)
      if (!resp) {
        reply.status(400).send('User already exists')
      }
      reply.status(201).send(resp)
    }
  )
}
