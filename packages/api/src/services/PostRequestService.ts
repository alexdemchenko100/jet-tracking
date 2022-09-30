import { db, MonitorResult, MonitorRunResult } from '@httpmon/db'
import { logger } from 'src/Context'
import { handleOndemandResult } from './OndemandService'
import {
  sendSlackNotification,
  sendMSTeamsNotification,
  sendEmailNotification,
} from './SlackNotification'

export async function handlePostRequest(monrun: MonitorRunResult) {
  const mon = monrun.mon

  if (monrun.mon.status == 'ondemand') {
    const handled = await handleOndemandResult(monrun)
    if (!handled) {
      logger.error('Ondemand entry not found ... msg not processed')
      throw new Error('EONDEMAND_PASS')
    }
    return
  }

  let failCount = mon.notifications?.failCount ?? 0
  let failTimeMinutes = mon.notifications?.failTimeMinutes ?? 0

  /**

  1. Return if failCount and failTimeMin are both 0 (ie notifications are OFF)

  2. get current monitor notification state. Notified or not

  3. on success result,
     if Notified, move to Recovered and send Recovery Notification

  4. on error result,
     if not-notifed yet,
     a) check if eligible for notification by checking
       i) failCount is reached
       ii) failtTimeMinutes is past
     b) move to Notified and send Down Notification

   **/

  //1
  if (failCount == 0 && failTimeMinutes == 0) return

  //2
  const notifierState = await db
    .selectFrom('ActivityLog')
    .selectAll()
    .orderBy('createdAt', 'desc')
    .where('monitorId', '=', mon.id)
    .limit(1)
    .executeTakeFirst()

  let bAlerted = false

  if (notifierState) {
    bAlerted = notifierState.type == 'MONITOR_DOWN'
  }

  //3.

  const bError = Boolean(monrun.err?.msg)

  if (!bError) {
    //success
    if (bAlerted) {
      await db
        .insertInto('ActivityLog')
        .values({
          monitorId: monrun.mon.id,
          resultId: monrun.resultId ?? '',
          accountId: mon.accountId,
          type: 'MONITOR_RECOVERED',
          data: JSON.stringify({ msg: `Monitor ${mon.name} is up` }),
        })
        .returningAll()
        .executeTakeFirst()

      //send recovery notification
      const result = await db
        .selectFrom('MonitorResult')
        .selectAll()
        .where('accountId', '=', mon.accountId)
        .where('id', '=', monrun.resultId)
        .executeTakeFirst()

      if (!result) return

      if (mon.id) sendNotification('Recover', mon.accountId, mon.id, result)
    }
    return
  }

  /*
  4. on error result,
     if not-notifed yet,
     a) check if eligible for notification by checking
       i) failCount is reached
       ii) failtTimeMinutes is past
     b) move to Notified and send Down Notification

   **/

  if (bAlerted) return

  let bNotify = false
  let result: MonitorResult | null = null

  //handle case where monitor has failed more than the threshold
  logger.info(`monitor ${mon.id} failCount ${failCount} MS ${failTimeMinutes}`)

  if (failCount > 0) {
    const results = await db
      .selectFrom('MonitorResult')
      .selectAll()
      .orderBy('createdAt', 'desc')
      .where('monitorId', '=', mon.id!!)
      .limit(failCount)
      .execute()

    //if result count is same as failCount and all results are failed, send notification
    if (results.length == failCount && results.every((r) => r.err != '')) {
      //send notification
      bNotify = true
      result = results[0]
    }
  }

  const failTimeMS = failTimeMinutes * 60000 // get milliseconds from minutes
  if (failTimeMS > 0 && mon.id) {
    const failDate = new Date(Date.now() - failTimeMS)
    const results = await db
      .selectFrom('MonitorResult')
      .selectAll()
      .orderBy('createdAt', 'desc')
      .where('createdAt', '<', failDate)
      .where('monitorId', '=', mon.id)
      .where('accountId', '=', mon.accountId)
      .execute()

    //if result count is same as failCount and all results are failed, send notification
    if (results.length > 0 && results.every((r) => r.err != '')) {
      //send notification
      bNotify = true
      result = results[0]
    }
  }

  if (bNotify && result) {
    await db
      .insertInto('ActivityLog')
      .values({
        monitorId: mon.id,
        resultId: monrun.resultId ?? '',
        accountId: mon.accountId,
        type: 'MONITOR_DOWN',
        data: JSON.stringify({ msg: `Monitor ${monrun.mon.name} is down` }),
      })
      .returningAll()
      .executeTakeFirst()
    sendNotification('Alert', monrun.mon.accountId, mon.id!!, result)
  }
}

async function sendNotification(
  type: string,
  accountId: string,
  monitorId: string,
  result: MonitorResult
) {
  let channels: string[] = []

  //now, get the monitor from db
  const monitor = await db
    .selectFrom('Monitor')
    .selectAll()
    .where('accountId', '=', accountId)
    .where('id', '=', monitorId)
    .executeTakeFirst()

  //if monitor is not found, return
  if (!monitor || !monitor.notifications) {
    logger.error('monitor not found')
    return
  }

  if (monitor.notifications?.useGlobal) {
    const defaultEnabledChannels = await db
      .selectFrom('NotificationChannel')
      .select(['id'])
      .where('accountId', '=', accountId)
      .where('isDefaultEnabled', '=', true)
      .execute()
    channels = defaultEnabledChannels.map((channel) => channel.id ?? '')
  } else {
    channels = monitor.notifications?.channels ?? []
  }

  channels.forEach(async (channel) => {
    const notificationChannel = await db
      .selectFrom('NotificationChannel')
      .selectAll()
      .where('id', '=', channel)
      .executeTakeFirst()

    if (notificationChannel && notificationChannel.channel.type === 'slack' && result) {
      logger.info(`sending notification to channel ${channel}`)
      sendSlackNotification(type, notificationChannel.channel, monitor, result)
    }

    if (notificationChannel && notificationChannel.channel.type === 'ms-teams' && result) {
      logger.info(`sending notification to MSteams channel ${channel}`)
      sendMSTeamsNotification(type, notificationChannel.channel, monitor, result)
    }

    if (notificationChannel && notificationChannel.channel.type === 'email' && result) {
      logger.info(`sending email notification to channel ${channel}`)
      sendEmailNotification(type, notificationChannel.channel, monitor, result)
    }
  })
}
