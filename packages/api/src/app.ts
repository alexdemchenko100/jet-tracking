import fastify from 'fastify'
import fastifyCors from 'fastify-cors'
import router from './router.js'
import { schedule } from './scheduler.js'
import * as dotenv from 'dotenv'
import path from 'path'

//find and load the .env from root folder of the project
dotenv.config({ path: path.resolve(process.cwd(), '../..', '.env') })

const server = fastify({
  logger: {
    prettyPrint: true,
    level: 'info',
  },
})

// Middleware: Router
server.register(router)
server.register(fastifyCors)

server.addHook('preValidation', (req, _, done) => {
  req.log.info({ url: req.url, body: req.body, id: req.id }, 'received request')
  done()
})

server.setErrorHandler((error, _req, reply) => {
  // The expected errors will be handled here, but unexpected ones should eventually result in a crash.

  server.log.error(error)

  reply.code(409).send({ error: 'top level error' })
})

setInterval(async () => {
  schedule()
}, 10 * 1000)

export default server
