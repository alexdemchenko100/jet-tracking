import fastify from 'fastify'
import router from './router.js'
import { schedule } from './scheduler.js'

const server = fastify({
  logger: { prettyPrint: true },
})

// Middleware: Router
server.register(router)

server.setErrorHandler((error, _req, reply) => {
  // The expected errors will be handled here, but unexpected ones should eventually result in a crash.

  server.log.error(error)

  reply.code(409).send({ error: 'top level error' })
})

setInterval(async () => {
  schedule()
}, 10 * 1000)

export default server
