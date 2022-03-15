import fastify from 'fastify'
import fastifyCors from 'fastify-cors'
import router from './router.js'
import * as dotenv from 'dotenv'
import path from 'path'
import fastifyStatic from 'fastify-static'

//find and load the .env from root folder of the project
dotenv.config({ path: path.resolve(process.cwd(), '../..', '.env') })

const server = fastify({
  logger: {
    prettyPrint: true,
    level: 'info',
  },
})

if (process.env.NODE_ENV === 'production') {
  server.register(fastifyStatic, {
    root: path.join(process.cwd(), './packages/web/dist/'),
    prefix: '/', // optional: default '/'
  })
  server.setNotFoundHandler((req, reply) => {
    //this is hack with knowledge of route prefix /api built in
    //unfortunately, router-specifc handler is not being called
    if (req.url.startsWith('/api')) {
      reply.code(404).send('not found')
      return
    }
    reply.sendFile('index.html')
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
