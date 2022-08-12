import { FastifyInstance } from 'fastify'
import MonitorRouter from './AuthRouters/MonitorRouter.js'
import MonitorRunRouter from './CloudHookRouters/MonitorRunRouter.js'
import SchedulerRouter from './CloudHookRouters/SchedulerRouter.js'
import MonitorPostRequestRouter from './CloudHookRouters/MonitorPostRequestRouter.js'
import OndemandMonitorRouter from './PublicRouters/OndemandMonitorRouter.js'
import EnvRouter from './AuthRouters/EnvRouter.js'
import SettingsRouter from './AuthRouters/SettingsRouter.js'
import MonitorPreRequestRouter from './CloudHookRouters/MonitorPreRequestRouter.js'
import SettingsPublicRouter from './PublicRouters/SettingsPublicRouter.js'
import StatusPagesRouter from './AuthRouters/StatusPagesRouter.js'
import ActivityLogRouter from './AuthRouters/ActivityLogRouter.js'
import StatusPublicRouter from './PublicRouters/StatusPublicRouter.js'
import BillingRouter from './AuthRouters/BillingRouter.js'

export default async function MainRouter(fastify: FastifyInstance) {
  //Public API router
  fastify.register(OndemandMonitorRouter, { prefix: '/ondemand' })
  fastify.register(SettingsPublicRouter, { prefix: '/settings' })
  fastify.register(StatusPublicRouter, { prefix: '/status' })

  //Authorized APIs
  fastify.register(MonitorRouter, { prefix: '/monitors' })
  fastify.register(EnvRouter, { prefix: '/environments' })
  fastify.register(SettingsRouter, { prefix: '/settings' })
  fastify.register(StatusPagesRouter, { prefix: '/status-pages' })
  fastify.register(ActivityLogRouter, { prefix: '/activity-logs' })
  fastify.register(BillingRouter, { prefix: '/billing' })

  //cloud hooks for backend processing
  fastify.register(SchedulerRouter, { prefix: '/services/scheduler' })
  fastify.register(MonitorPreRequestRouter, { prefix: '/services/monitor-prerequest' })
  fastify.register(MonitorRunRouter, { prefix: '/services/monitor-run' })
  fastify.register(MonitorPostRequestRouter, { prefix: '/services/monitor-postrequest' })

  fastify.setNotFoundHandler((_req, reply) => {
    // The expected errors will be handled here, but unexpected ones should eventually result in a crash.
    reply.code(409).send({ error: 'top level unknown error' })
  })
}
