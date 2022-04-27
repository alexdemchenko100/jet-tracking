import { db, MonitorResult } from '@httpmon/db'
import { send } from 'process'
import { logger } from 'src/Context'
import { SynthEvent } from './EventService'
import { sendSlackNotification } from './SlackNotification'

export async function handleMonitorResultErorr(event: SynthEvent) {
  //from event id, get monitor result from db

  //now, get the monitor from db
  const monitor = await db
    .selectFrom('Monitor')
    .selectAll()
    .where('id', '=', event.monitorId)
    .executeTakeFirst()

  //if monitor is not found, return
  if (!monitor || !monitor.notifications) {
    logger.error('monitor not found')
    return
  }

  let bNotify = false
  let result: MonitorResult | null = null

  try {
    //handle case where monitor has failed more than the threshold
    const failCount = monitor.notifications.failCount ?? 0
    logger.info(`monitor ${event.monitorId} failCount ${failCount}`)

    if (failCount > 0 && event.monitorId) {
      const results = await db
        .selectFrom('MonitorResult')
        .selectAll()
        .orderBy('createdAt', 'desc')
        .where('monitorId', '=', event.monitorId)
        .limit(failCount)
        .execute()

      //if result count is same as failCount and all results are failed, send notification
      if (results.length == failCount && results.every((r) => r.err != '')) {
        //send notification
        bNotify = true
        result = results[0]
      }
    }

    const failTimeMS = monitor.notifications.failTimeMS ?? 0
    if (failTimeMS > 0) {
      const failDate = new Date(Date.now() - failTimeMS)
      const results = await db
        .selectFrom('MonitorResult')
        .selectAll()
        .orderBy('createdAt', 'desc')
        .where('createdAt', '<', failDate)
        .execute()

      //if result count is same as failCount and all results are failed, send notification
      if (results.length == 1 && results[0].totalTime > failTimeMS) {
        //send notification
        bNotify = true
        result = results[0]
      }
    }
  } catch (e) {
    logger.error(e)
  }

  if (bNotify) {
    logger.info(`sending notification for monitor: ${event.monitorId}`)

    monitor.notifications.channels?.forEach((channel) => {
      if (channel.type == 'Slack' && result) {
        const msg = `Monitor ${event.monitorId} failed`
        logger.info(`sending notification to channel ${channel}`)
        sendSlackNotification(channel, monitor, result)
      }
    })
  }
}
