import { PubSub } from '@google-cloud/pubsub'
import { logger, state } from '../Context'
import S from 'fluent-json-schema'

export interface SynthEvent {
  type: string
  id?: string
  accountId?: string
  name?: string
  message?: string
}

export const SynthEventSchema = S.object()
  .prop('type', S.string())
  .required()
  .prop('id', S.string())
  .prop('accountId', S.string())
  .prop('name', S.string())
  .prop('message', S.string())

let pubsub: PubSub | null = null

export async function publishEvent(event: SynthEvent) {
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
    logger.error(
      `Received error while publishing to ${projectId}-events - ${error.message}`
    )
  }
}
