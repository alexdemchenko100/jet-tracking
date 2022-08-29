import fastify from 'fastify'
import { initializeRequestContext, getCloudRegion, plogger } from './services/Context'
import PreScriptRouter from './routers/PreScriptRouter'
import testRouter from './routers/testRouter'

const server = fastify({
  logger: plogger,
})

async function start() {
  //find and load the .env from root folder of the project

  await initializeRequestContext(server)

  if (process.env.NODE_ENV === 'production') {
    server.log.info(`production mode: ${getCloudRegion()}`)
    // const bLocal = process.env.NODE_RUN === 'local'

    // const appRoot = path.join(
    //   process.cwd(),
    //   bLocal ? '../../packages/web/dist/' : './packages/web/dist/'
    // )

    // await server.register(fastifyStatic, {
    //   root: appRoot,
    //   prefix: '/', // optional: default '/'
    // })
  }

  // Middleware: Router

  // if (process.env.NODE_ENV != 'production') {
  await server.register(testRouter, { prefix: '/test' })
  // }

  await server.register(PreScriptRouter, { prefix: '/api/services/api-script-run' })

  server.setErrorHandler((error, _req, reply) => {
    // The expected errors will be handled here, but unexpected ones should eventually result in a crash.
    server.log.error(error, 'TOP Error Handler')
    reply.code(409).send({ error: error })
  })

  //set up exit handler
  process.on('SIGTERM', async function () {
    server.log.info(`SIGTERM received, exiting gracefully: ${getCloudRegion()}`)
    process.exit(0)
  })

  const FASTIFY_PORT = Number(process.env.PORT) || 8081

  await server.listen(FASTIFY_PORT, '0.0.0.0')
  server.log.info(`🚀  Fastify server running on port ${FASTIFY_PORT}`)
}

start()

export default server
