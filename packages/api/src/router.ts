import { FastifyInstance } from 'fastify'
import IndexController from './controller/index-controller.js'
import MonitorController from './controller/monitor-controller.js'

export default async function router(fastify: FastifyInstance) {
  fastify.register(IndexController, { prefix: '/' })
  fastify.register(MonitorController, { prefix: '/monitors' })
}
