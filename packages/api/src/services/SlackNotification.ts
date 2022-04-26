import { MonitorResult, NotificationChannel } from '@httpmon/db'
import got from 'got'

export function sendSlackNotification(
  channel: NotificationChannel,
  result: MonitorResult
) {
  got.post(channel.target, {
    json: {
      text: `${result.id}:  Monitor ${result.monitorId} failed: ${result.err}`,
    },
  })
}
