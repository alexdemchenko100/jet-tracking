import { Monitor, MonitorResult, SlackNotificationChannel } from '@httpmon/db'
import got from 'got'
import { formatAssertionResults } from './Assertions'

export function sendSlackNotification(
  channel: SlackNotificationChannel,
  monitor: Monitor,
  result: MonitorResult
) {
  got.post(channel.webhookUrl, {
    json: {
      text: `Monitor *${monitor.name}* failed\n
      Url: ${monitor.url}
      Location: ${result.location}
      Error: ${result.err}
      ${formatAssertionResults(result)}
      Result: ${result.id}`,
    },
  })
}
