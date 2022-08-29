import { FastifyLoggerInstance } from 'fastify'
import { fastifyRequestContextPlugin, requestContext } from 'fastify-request-context'
import * as gcpMetadata from 'gcp-metadata'

import pino, { LoggerOptions } from 'pino'
const isCloud = process.env.NODE_ENV === 'production'
const PinoLevelToSeverity: { [k: string]: string } = {
  silent: 'OFF',
  trace: 'DEBUG',
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
  fatal: 'CRITICAL',
}
const productionPinoConfig: LoggerOptions = {
  level: 'info',
  prettyPrint: false,
  messageKey: 'message',
  base: null,
  formatters: {
    level(label: string, _number: number) {
      return {
        severity: PinoLevelToSeverity[label] || 'INFO',
      }
    },
    log(object) {
      const logObject = object as { err?: Error }
      const stackProp = logObject?.err?.stack ? { stack_trace: logObject.err.stack } : {}
      return { ...object, ...stackProp }
    },
  },
  timestamp: () => `,"eventTime":${Date.now() / 1000.0}`,
}

export const plogger = pino(isCloud ? productionPinoConfig : {})

interface WebAppState {
  projectId: string
  region: string
}

export const state: WebAppState = {
  projectId: '',
  region: '',
}

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

export const getCloudRegion = () => {
  if (!state.region) {
    if (process.env.NODE_ENV !== 'production') {
      //if not in cloud environment, use a random region to spice things up
      return ['us-east1', 'europe-west3'][Math.floor(Math.random() * 2)]
    }
  }
  return state.region
}

async function initGCPMetadata() {
  try {
    const isAvailable = await gcpMetadata.isAvailable()

    // Instance and Project level metadata will only be available if
    // running inside of a Google Cloud compute environment such as
    // Cloud Functions, App Engine, Kubernetes Engine, or Compute Engine.
    // To learn more about the differences between instance and project
    // level metadata, see:
    // https://cloud.google.com/compute/docs/storing-retrieving-metadata#project-instance-metadata
    if (isAvailable) {
      state.projectId = await gcpMetadata.project('project-id')

      const gcpRegion = await gcpMetadata.instance('region')
      //get last word after slash
      state.region = gcpRegion.split('/').pop()

      const zone = await gcpMetadata.instance('zone')
      logger.info(`Project ID: ${state.projectId} Region: ${state.region} Zone: ${zone}`)
    }
  } catch (error) {
    logger.error(error)
  }
}

export async function initializeRequestContext(server: any) {
  server.register(fastifyRequestContextPlugin)

  //wrap in an async function so we can await initGCPMetadata
  await initGCPMetadata()

  //set a hook to set the logger for each request
  server.addHook('onRequest', async (req: any) => {
    server.log.info(`server request received: ${req.raw.url}`)
    requestContext.set('logger', server.log)
  })
}
