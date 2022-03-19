import fastify from 'fastify'
import fastifyCors from 'fastify-cors'
import router from './router.js'
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

if (process.env.NODE_ENV === 'production') {
  server.setNotFoundHandler((_req, reply) => {
    reply.code(404).send('not found')
  })
} else {
  server.register(fastifyCors)
}

// Middleware: Router
server.register(router, {
  prefix: '/api',
})

server.addHook('preValidation', (req, _, done) => {
  req.log.info({ url: req.url, body: req.body, id: req.id }, 'received request')
  done()
})

server.setErrorHandler((error, _req, reply) => {
  // The expected errors will be handled here, but unexpected ones should eventually result in a crash.
  server.log.error(error)
  reply.code(409).send({ error: 'top level error' })
})

export default server
