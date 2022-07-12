import {
  Monitor,
  MonitorResult,
  SlackNotificationChannel,
  MSTeamsNotificationChannel,
  EmailNotificationChannel,
} from '@httpmon/db'
import got from 'got'
import { formatAssertionResults } from './Assertions'
import { sendNotificationEmail } from './SendgridService'

export function sendSlackNotification(
  type: string,
  channel: SlackNotificationChannel,
  monitor: Monitor,
  result: MonitorResult
) {
  let message = ''
  if (type == 'Alert') {
    message = `Monitor *${monitor.name}* failed\n
    Url: ${monitor.url}
    Location: ${result.location}
    Error: ${result.err}
    ${formatAssertionResults(result)}
    Result: ${result.id}`
  } else if (type == 'Recover') {
    //its receovery
    message = `Monitor *${monitor.name}* recovered and its Up now\n
    Url: ${monitor.url}
    Location: ${result.location}
    Result: ${result.id}`
  }

  got.post(channel.webhookUrl, {
    json: {
      text: message,
    },
  })
}

export function sendMSTeamsNotification(
  type: string,
  channel: MSTeamsNotificationChannel,
  monitor: Monitor,
  result: MonitorResult
) {
  let message = ''
  if (type == 'Alert') {
    message = `Monitor *${monitor.name}* failed\n
    Url: ${monitor.url}
    Location: ${result.location}
    Error: ${result.err}
    ${formatAssertionResults(result)}
    Result: ${result.id}`
  } else if (type == 'Recover') {
    //its receovery
    message = `Monitor *${monitor.name}* recovered and its Up now\n
    Url: ${monitor.url}
    Location: ${result.location}
    Result: ${result.id}`
  }

  got.post(channel.webhookUrl, {
    json: {
      type: 'message',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          contentUrl: null,
          content: {
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            type: 'AdaptiveCard',
            version: '1.2',
            body: [
              {
                type: 'TextBlock',
                text: message,
              },
            ],
          },
        },
      ],
    },
  })
}

export function sendEmailNotification(
  type: string,
  channel: EmailNotificationChannel,
  monitor: Monitor,
  result: MonitorResult
) {
  let message = ''
  if (type == 'Alert') {
    message = `Monitor *${monitor.name}* failed\n
    Url: ${monitor.url}
    Location: ${result.location}
    Error: ${result.err}
    ${formatAssertionResults(result)}
    Result: ${result.id}`
  } else if (type == 'Recover') {
    //its receovery
    message = `Monitor *${monitor.name}* recovered and its Up now\n
    Url: ${monitor.url}
    Location: ${result.location}
    Result: ${result.id}`
  }
  sendNotificationEmail(channel.email, message)
}
