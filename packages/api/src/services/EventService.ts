import { PubSub } from '@google-cloud/pubsub'
import { logger, state } from '../Context'

interface SynthEvent {
  type: string
  id?: string
  name?: string
  message?: string
  accountId?: string
}

let pubsub: PubSub | null = null

export async function publishEvent(event: SynthEvent) {
  const projectId = state.projectId
  if (!pubsub) {
    pubsub = new PubSub({ projectId })
  }

  if (!pubsub) throw new Error('Pubsub is not initialized')

  //publish  to cloud pubsub
  try {
    await pubsub.topic(`${projectId}-events`).publishMessage({ json: event })
  } catch (error) {
    logger.error(
      `Received error while publishing to ${projectId}-events - ${error.message}`
    )
  }
}
