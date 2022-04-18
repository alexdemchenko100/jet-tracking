import { FastifyLoggerInstance } from 'fastify'
import {
  fastifyRequestContextPlugin,
  requestContext,
} from 'fastify-request-context'

import pino from 'pino'
const plogger = pino()

interface UserInfo {
  user: string
  accountId: string
}

declare module 'fastify-request-context' {
  interface RequestContextData {
    user: UserInfo
    logger: FastifyLoggerInstance
  }
}

export const logger = new Proxy(plogger as FastifyLoggerInstance, {
  get(target, property, receiver) {
    target = (requestContext.get('logger') as FastifyLoggerInstance) || target
    return Reflect.get(target, property, receiver)
  },
})

export const currentUserInfo = () => {
  const userInfo = requestContext.get('user') as UserInfo
  if (!userInfo) {
    throw new Error('No user info in request context')
  }
  return userInfo
}

export function initializeRequestContext(server: any) {
  server.register(fastifyRequestContextPlugin)
  server.addHook('onRequest', async (req: any) => {
    server.log.info(`server request received: ${req.raw.url}`)
    requestContext.set('logger', server.log)
  })
}
