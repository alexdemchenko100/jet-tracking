import { FastifyInstance } from 'fastify'
import MonitorRouter from './AuthRouters/Admin/MonitorRouter.js'
import MonitorRunRouter from './CloudHookRouters/MonitorRunRouter.js'
import SchedulerRouter from './CloudHookRouters/SchedulerRouter.js'
import MonitorPostRequestRouter from './CloudHookRouters/MonitorPostRequestRouter.js'
import OndemandMonitorRouter from './AuthRouters/OndemandMonitorRouter.js'
import EnvRouter from './AuthRouters/Admin/EnvRouter.js'
import SettingsRouter from './AuthRouters/Admin/SettingsRouter.js'
import SettingsPublicRouter from './PublicRouters/SettingsPublicRouter.js'
import StatusPagesRouter from './AuthRouters/Admin/StatusPagesRouter.js'
import ActivityLogRouter from './AuthRouters/Admin/ActivityLogRouter.js'
import ApiKeyRouter from './AuthRouters/Admin/ApiKeyRouter.js'
import StatusPublicRouter from './PublicRouters/StatusPublicRouter.js'
import BillingRouter from './AuthRouters/Owner/BillingRouter.js'
import MonitorPreRequestRouter from './CloudHookRouters/MonitorPreRequestRouter.js'
import MonitorViewerRouter from './AuthRouters/MonitorRouter'
import SettingsViewerRouter from './AuthRouters/SettingsRouter'
import PreScriptResultRouter from './CloudHookRouters/PreScriptResultRouter.js'
import TeamRouter from './AuthRouters/Admin/TeamRouter.js'
import AccountsRouter from './AuthRouters/AccountsRouter.js'

export default async function MainRouter(fastify: FastifyInstance) {
  //Public API router
  await fastify.register(SettingsPublicRouter, { prefix: '/settings' })
  await fastify.register(StatusPublicRouter, { prefix: '/status' })

  //Authorized APIs
  await fastify.register(OndemandMonitorRouter, { prefix: '/ondemand' })
  await fastify.register(AccountsRouter, { prefix: '/accounts' })
  await fastify.register(MonitorViewerRouter, { prefix: '/monitors' })
  await fastify.register(SettingsViewerRouter, { prefix: '/settings' })
  await fastify.register(MonitorRouter, { prefix: '/monitors' })
  await fastify.register(EnvRouter, { prefix: '/environments' })
  await fastify.register(TeamRouter, { prefix: '/team' })
  await fastify.register(SettingsRouter, { prefix: '/settings' })
  await fastify.register(StatusPagesRouter, { prefix: '/status-pages' })
  await fastify.register(ActivityLogRouter, { prefix: '/activity-logs' })
  await fastify.register(BillingRouter, { prefix: '/billing' })
  await fastify.register(ApiKeyRouter, { prefix: '/api-keys' })

  //cloud hooks for backend processing
  await fastify.register(SchedulerRouter, { prefix: '/services/scheduler' })
  await fastify.register(MonitorRunRouter, { prefix: '/services/monitor-run' })
  await fastify.register(MonitorPreRequestRouter, { prefix: '/services/monitor-prerequest' })
  await fastify.register(PreScriptResultRouter, { prefix: '/services/api-script-result' })
  await fastify.register(MonitorPostRequestRouter, { prefix: '/services/monitor-postrequest' })

  await fastify.setNotFoundHandler((_req, reply) => {
    // The expected errors will be handled here, but unexpected ones should eventually result in a crash.
    reply.code(409).send({ error: 'top level unknown error' })
  })
}
