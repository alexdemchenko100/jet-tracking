import { MonitorResult, NotificationChannel } from '@httpmon/db'
import got from 'got'

export function sendSlackNotification(
  channel: NotificationChannel,
  result: MonitorResult
) {
  got.post(channel.target, {
    json: {
      text: `Monitor ${result.monitorId} failed: ${result.err}`,
    },
  })
}
