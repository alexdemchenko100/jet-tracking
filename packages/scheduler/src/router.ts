import { FastifyInstance } from 'fastify'
import Scheduler from './Scheduler'

export default async function router(fastify: FastifyInstance) {
  fastify.register(Scheduler, { prefix: '/schedule' })

  fastify.setNotFoundHandler((_req, reply) => {
    // The expected errors will be handled here, but unexpected ones should eventually result in a crash.
    reply.code(409).send({ error: 'top level unknown error' })
  })
}
