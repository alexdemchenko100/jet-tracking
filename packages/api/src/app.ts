import fastify from 'fastify'
import router from './router.js'
// logger: !!(process.env.NODE_ENV !== "development"),

const server = fastify({
  // Logger only for production
  logger: {},
})

// Middleware: Router
server.register(router)

export default server
