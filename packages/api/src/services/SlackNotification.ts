import { Monitor, MonitorResult, SlackNotificationChannel, MSTeamsNotificationChannel } from '@httpmon/db'
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

export function sendMSTeamsNotification(
  channel: MSTeamsNotificationChannel,
  monitor: Monitor,
  result: MonitorResult
) {
  got.post(channel.webhookUrl, {
    json: {
      type: "message",
      attachments:  [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          contentUrl: null,
          content: {
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            type: "AdaptiveCard",
            version: "1.2",
            body: [
              {
                type: "TextBlock",
                text: `Monitor *${monitor.name}* failed\n
                  Url: ${monitor.url}
                  Location: ${result.location}
                  Error: ${result.err}
                  ${formatAssertionResults(result)}
                  Result: ${result.id}`,
              }
            ]
          }
        }
      ]
    }
  })
}
