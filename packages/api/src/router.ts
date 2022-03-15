import {
  FastifyInstance,
  FastifyPluginOptions,
  HookHandlerDoneFunction,
} from 'fastify'
import MonitorController from './controller/monitor-controller.js'
import SchedulerController from './controller/scheduler-controller.js'

export default async function router(fastify: FastifyInstance) {
  fastify.register(MonitorController, { prefix: '/monitors' })
  fastify.register(SchedulerController, { prefix: '/schedule' })

  fastify.setNotFoundHandler((_req, reply) => {
    // The expected errors will be handled here, but unexpected ones should eventually result in a crash.
    reply.code(409).send({ error: 'top level unknown error' })
  })
}
