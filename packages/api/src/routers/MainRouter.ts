import { FastifyInstance } from 'fastify'
import MonitorRouter from './AuthRouters/MonitorRouter.js'
import MonitorExecutorRouter from './CloudHookRouters/MonitorExecutorRouter.js'
import SchedulerRouter from './CloudHookRouters/SchedulerRouter.js'
import NotificationRouter from './CloudHookRouters/NotificationRouter.js'
import OndemandMonitorRouter from './PublicRouters/OndemandMonitorRouter.js'
import EnvRouter from './AuthRouters/EnvRouter.js'
import SettingsRouter from './AuthRouters/SettingsRouter.js'

export default async function MainRouter(fastify: FastifyInstance) {
  //Public API router
  fastify.register(OndemandMonitorRouter, { prefix: '/ondemand' })

  //Authorized APIs
  fastify.register(MonitorRouter, { prefix: '/monitors' })
  fastify.register(EnvRouter, { prefix: '/environments' })
  fastify.register(SettingsRouter, { prefix: '/settings' })

  //cloud hooks for backend processing
  fastify.register(SchedulerRouter, { prefix: '/services/scheduler' })
  fastify.register(MonitorExecutorRouter, { prefix: '/services/monitor' })
  fastify.register(NotificationRouter, { prefix: '/services/notification' })

  fastify.setNotFoundHandler((_req, reply) => {
    // The expected errors will be handled here, but unexpected ones should eventually result in a crash.
    reply.code(409).send({ error: 'top level unknown error' })
  })
}
