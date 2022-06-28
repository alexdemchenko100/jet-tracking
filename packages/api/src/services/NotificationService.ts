import { db, MonitorResult } from '@httpmon/db'
import { send } from 'process'
import { logger } from 'src/Context'
import { SynthEvent } from './EventService'
import { sendSlackNotification, sendMSTeamsNotification } from './SlackNotification'

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

  let failCount = 0,failTimeMinutes = 0
  let channels: string[] = []

  // check if monitor uses global settings
  if (monitor.notifications.useGlobal && event.accountId) {
    const globalNotificationSettings = await db
      .selectFrom('Settings')
      .selectAll()
      .where('accountId', '=', event.accountId)
      .executeTakeFirst()
    const defaultEnabledChannels = await db
      .selectFrom('NotificationChannel')
      .select(['id'])
      .where('accountId', '=', event.accountId)
      .where('isDefaultEnabled', '=', true)
      .execute()
    if (globalNotificationSettings) {
      failCount = globalNotificationSettings.alert.failCount || 0
      failTimeMinutes = globalNotificationSettings.alert.failTimeMinutes || 0
      channels = defaultEnabledChannels.map(channel => channel.id ?? '')
    }
  } else {
    failCount = monitor.notifications.failCount ?? 0
    failTimeMinutes = monitor.notifications.failTimeMinutes ?? 0
    channels = monitor.notifications.channels || []
  }

  try {
    //handle case where monitor has failed more than the threshold
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

    const failTimeMS = failTimeMinutes * 60000 // get microseconds from minutes
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
    logger.info(`sending notification for monitor: ${channels}`)

    channels.forEach(async (channel) => {
      const notificationChannel = await db
        .selectFrom('NotificationChannel')
        .selectAll()
        .where('id', '=', channel)
        .executeTakeFirst()
      
      if (notificationChannel && notificationChannel.channel.type === 'slack' && result) {
        logger.info(`sending notification to channel ${channel}`)
        sendSlackNotification(notificationChannel.channel, monitor, result)
      }

      if (notificationChannel && notificationChannel.channel.type === 'ms-teams' && result) {
        logger.info(`sending notification to MSteams channel ${channel}`)
        sendMSTeamsNotification(notificationChannel.channel, monitor, result)
      }
    })
  }
}
