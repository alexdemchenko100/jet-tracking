import app from './app.js'

const FASTIFY_PORT = Number(process.env.FASTIFY_PORT) || 3006

app.listen(FASTIFY_PORT)

console.log(`🚀  Fastify server running on port ${FASTIFY_PORT}`)

app.ready(() => {
  console.log(app.printPlugins())
  console.log(app.printRoutes())
})
