import { FastifyInstance } from 'fastify'
import MonitorRouter from './routers/MonitorRouter.js'
import MonitorExecutorRouter from './routers/MonitorExecutorRouter.js'
import SchedulerRouter from './routers/SchedulerRouter.js'
import NotificationRouter from './routers/NotificationRouter.js'
import OndemandMonitorRouter from './routers/OndemandMonitorRouter.js'
import EnvRouter from './routers/EnvRouter.js'
import SettingsRouter from './routers/SettingsRouter.js'
import { requestContext } from 'fastify-request-context'
import { createNewAccount, getAccountIdByUser } from './services/DBService'
import { firebaseAuth } from './Firebase'

export default async function router(fastify: FastifyInstance) {
  fastify.register(OndemandMonitorRouter, { prefix: '/ondemand' })
  fastify.register(MonitorRouter, { prefix: '/monitors' })
  fastify.register(EnvRouter, { prefix: '/environments' })
  fastify.register(SchedulerRouter, { prefix: '/services/scheduler' })
  fastify.register(MonitorExecutorRouter, { prefix: '/services/monitor' })
  fastify.register(NotificationRouter, { prefix: '/services/notification' })
  fastify.register(SettingsRouter, { prefix: '/settings' })

  fastify.setNotFoundHandler((_req, reply) => {
    // The expected errors will be handled here, but unexpected ones should eventually result in a crash.
    reply.code(409).send({ error: 'top level unknown error' })
  })

  fastify.addHook('onRequest', async (request: any, reply: any) => {
    const authHeader = request.headers.authorization ?? ''
    let user = null

    const [bearer = '', token] = authHeader.split(' ')
    if (bearer.trim().toLowerCase() !== 'bearer') {
      fastify.log.error('error in parsing auth header')
      reply.code(401).send({ message: 'Bad token format' })
      return
    }

    try {
      user = await firebaseAuth.verifyIdToken(token)
    } catch (error) {
      fastify.log.error(error)
      reply.code(401).send({ message: 'Not authorized' })
      return
    }

    let accountId = await getAccountIdByUser(user.uid)
    if (!accountId) {
      fastify.log.error(`user ${user.uid} ${user.email} not found`)

      //It may be a new user, so create an account for them
      accountId = await createNewAccount(user.uid, user.email ?? '')
    }

    request.requestContext.set('user', { user: user.email, accountId })
    fastify.log.info(requestContext.get('user'), 'user authorized')
  })
}
