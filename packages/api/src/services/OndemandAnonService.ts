import { currentUserInfo, logger, state } from '../Context'
import { v4 as uuidv4 } from 'uuid'
import { Monitor, MonitorRunResult } from '@httpmon/db'
import { emitter } from './emitter'
import { publishMonitorPreRequestMessage } from './PubSubService'
import { Message, PubSub } from '@google-cloud/pubsub'

let pubsub: PubSub | null = null

export async function runAnonOndemand(mon: Monitor) {
  return new Promise((odResolve, odReject) => {
    // Prepare monitor as its not from database and needs context
    if (!mon.id) mon.id = uuidv4()

    const monrun: MonitorRunResult = { mon, runId: uuidv4() }
    publishMonitorPreRequestMessage(monrun)

    let timer: NodeJS.Timeout
    const timeoutSeconds = 30 //seconds

    if (process.env.NODE_ENV != 'production') {
      //test mode
      const unsubscribe = emitter.on(
        'monitor-ondemand-response',
        async (monrunResp: MonitorRunResult) => {
          if (monrunResp.runId == monrun.runId) {
            logger.info({ id: monrunResp.result?.totalTime }, 'topic: monitor-ondemand-response')
            unsubscribe()
            clearTimeout(timer)
            //resolve
            odResolve(monrunResp.result)
          } else {
            logger.error({ id: monrunResp.result?.totalTime }, 'unknown ondemand result')
          }
        }
      )

      timer = setTimeout(() => {
        odReject({ monitorId: mon.id, err: 'timeout' })
        unsubscribe()
      }, timeoutSeconds * 1000)
    } else {
      const projectId = state.projectId
      if (!pubsub) {
        pubsub = new PubSub({ projectId })
      }

      if (!pubsub) throw new Error('Pubsub is not initialized')

      // References an existing subscription
      const subscription = pubsub.subscription(
        `projects/${projectId}/subscriptions/monitor-ondemand-response-pull-sub`
      )

      // Listen for new messages until timeout is hit
      // Create an event handler to handle messages
      const messageHandler = (message: Message) => {
        const obj = JSON.parse(message.data.toString())
        const monrunResp = obj as MonitorRunResult
        if (monrunResp.runId == monrun.runId) {
          //if this is our message, Ack it and resolve the promise
          message.ack()
          subscription.removeListener('message', messageHandler)
          clearTimeout(timer)
          odResolve(monrunResp.result)
        } else {
          logger.error({ id: monrunResp.result?.totalTime }, 'unknown ondemand result')
        }
      }

      subscription.on('message', messageHandler)

      timer = setTimeout(() => {
        subscription.removeListener('message', messageHandler)
        odReject({ monitorId: mon.id, err: 'ondemand timedout at 15s' })
      }, timeoutSeconds * 1000)
    }
  })
}
