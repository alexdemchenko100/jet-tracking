import { createNewAccount, getAccountIdByUser } from '../services/DBService'
import { firebaseAuth } from '../Firebase'
import { SettingsService } from '../services/SettingsService'
import { FastifyInstance } from 'fastify'
import S from 'fluent-json-schema'
import { NotificationSchema, Notification } from '@httpmon/db'
import { requestContext } from 'fastify-request-context'

export default async function SettingsRouter(app: FastifyInstance) {
  const settingsService = SettingsService.getInstance()

  app.addHook('onRequest', async (request: any, reply) => {
    const authHeader = request.headers.authorization ?? ''
    let user = null

    const [bearer = '', token] = authHeader.split(' ')
    if (bearer.trim().toLowerCase() !== 'bearer') {
      app.log.error('error in parsing auth header')
      reply.code(401).send({ message: 'Bad token format' })
      return
    }

    try {
      user = await firebaseAuth.verifyIdToken(token)
    } catch (error) {
      app.log.error(error)
      reply.code(401).send({ message: 'Not authorized' })
      return
    }

    let accountId = await getAccountIdByUser(user.uid)
    if (!accountId) {
      app.log.error(`user ${user.uid} ${user.email} not found`)

      //It may be a new user, so create an account for them
      accountId = await createNewAccount(user.uid, user.email ?? '')
    }

    request.requestContext.set('user', { user: user.email, accountId })
    app.log.info(requestContext.get('user'), 'user authorized')
  })

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
  app.post<{ Body: Notification }>(
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
