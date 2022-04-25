import { FastifyLoggerInstance } from 'fastify'
import {
  fastifyRequestContextPlugin,
  requestContext,
} from 'fastify-request-context'
import * as gcpMetadata from 'gcp-metadata'

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
    projectId: string
    region: string
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
  const region = requestContext.get('region')
  if (!region) {
    //if not in cloud environment, use a random region to spice things up
    return ['us-east1', 'europe-west3'][Math.floor(Math.random() * 2)]
  }
  return region
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
      const projectId = await gcpMetadata.project('project-id')
      requestContext.set('projectId', projectId)
      const gcpRegion = await gcpMetadata.instance('region')
      //get last word after slash
      const region = gcpRegion.split('/').pop()
      requestContext.set('region', region)
      const zone = await gcpMetadata.instance('zone')

      logger.info(`Project ID: ${projectId} Region: ${region} Zone: ${zone}`)
    }
  } catch (error) {
    logger.error(error)
  }
}

export function initializeRequestContext(server: any) {
  server.register(fastifyRequestContextPlugin)

  //wrap in an async function so we can await initGCPMetadata
  ;(async () => {
    await initGCPMetadata()
  })()

  //set a hook to set the logger for each request
  server.addHook('onRequest', async (req: any) => {
    server.log.info(`server request received: ${req.raw.url}`)
    requestContext.set('logger', server.log)
  })
}
