import { PubSub } from '@google-cloud/pubsub'
import { logger, state } from '../Context'
import S from 'fluent-json-schema'
import emitter from './emitter'
import { MonitorNotifications, MonitorNotificationSchema } from '@httpmon/db'
export interface MonitorResultEvent {
  type: string
  accountId: string
  monitorId: string
  monitorName: string
  resultId: string
  err: string
  notifications: MonitorNotifications
}

export const MonitorResultEventSchema = S.object()
  .prop('type', S.string())
  .required()
  .prop('accountId', S.string())
  .prop('monitorId', S.string())
  .prop('monitorName', S.string())
  .prop('resultId', S.string())
  .prop('err', S.string())
  .prop('notifications', MonitorNotificationSchema)

let pubsub: PubSub | null = null

export async function publishPostRequestEvent(event: MonitorResultEvent) {
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
      .topic(`${projectId}-postrequest`)
      .publishMessage({ attributes: { type: event.type }, json: event })
    logger.info(event, `Published event ${event.type} to ${projectId}-events`)
  } catch (error) {
    logger.error(`Received error while publishing to ${projectId}-events - ${error.message}`)
  }
}

function publishLocally(event: MonitorResultEvent) {
  logger.info(event, 'Publishing locally')
  emitter.emit(event.type, event)
}
