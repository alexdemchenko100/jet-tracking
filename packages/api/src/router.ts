import {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from 'fastify'
import MonitorRouter from './routers/MonitorRouter.js'
import MonitorExecutorRouter from './routers/MonitorExecutorRouter.js'
import SchedulerRouter from './routers/SchedulerRouter.js'

export default async function router(fastify: FastifyInstance) {
  fastify.register(MonitorRouter, { prefix: '/monitors' })
  fastify.register(SchedulerRouter, { prefix: '/service/schedule' })
  fastify.register(MonitorExecutorRouter, { prefix: '/service/monitor' })

  fastify.setNotFoundHandler((_req, reply) => {
    // The expected errors will be handled here, but unexpected ones should eventually result in a crash.
    reply.code(409).send({ error: 'top level unknown error' })
  })
}
