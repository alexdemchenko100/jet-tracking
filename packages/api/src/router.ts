import { FastifyInstance } from 'fastify'
import MonitorRouter from './routers/MonitorRouter.js'
import MonitorExecutorRouter from './routers/MonitorExecutorRouter.js'
import SchedulerRouter from './routers/SchedulerRouter.js'
import NotificationRouter from './routers/NotificationRouter.js'
import OndemandMonitorRouter from './routers/OndemandMonitorRouter.js'
import EnvRouter from './routers/EnvRouter.js'
import SettingsRouter from './routers/SettingsRouter.js'

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
}
