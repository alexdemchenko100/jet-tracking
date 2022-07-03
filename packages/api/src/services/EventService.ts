import { PubSub } from '@google-cloud/pubsub'
import { logger, state } from '../Context'
import S from 'fluent-json-schema'
import emitter from './emitter'
import { MonitorNotifications } from '@httpmon/db'

export interface SynthEvent {
  type: string
  data: MonitorResultEvent
}

export interface MonitorResultEvent {
  accountId: string
  monitorId: string
  resultId: string
  err: string
  notifications: MonitorNotifications
}

export const SynthEventSchema = S.object()
  .prop('type', S.string())
  .required()
  .prop('data', S.object())

let pubsub: PubSub | null = null

export async function publishEvent(event: SynthEvent) {
  if (state.projectId === '' || process.env.NODE_ENV !== 'production') {
    publishLocally(event)
    return
  }

  const projectId = state.projectId
  if (!pubsub) {
    pubsub = new PubSub({ projectId })
  }

  if (!pubsub) throw new Error('Pubsub is not initialized')

  //publish  to cloud pubsub
  try {
    await pubsub
      .topic(`${projectId}-events`)
      .publishMessage({ attributes: { type: event.type }, json: event })
    logger.info(event, `Published event ${event.type} to ${projectId}-events`)
  } catch (error) {
    logger.error(`Received error while publishing to ${projectId}-events - ${error.message}`)
  }
}

function publishLocally(event: SynthEvent) {
  logger.info(event, 'Publishing locally')
  emitter.emit(event.type, event)
}
