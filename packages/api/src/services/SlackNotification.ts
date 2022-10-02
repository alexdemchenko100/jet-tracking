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

function getMonitorUrl(mon: Monitor) {
  return `${process.env.WEB_APP_URL}/console/monitors/${mon.id}`
}

function getResponseUrl(resp: MonitorResult) {
  if (resp) return `${process.env.WEB_APP_URL}/console/apiruns/${resp.id}`
  else return ''
}

export async function sendSlackNotification(
  type: string,
  channel: SlackNotificationChannel,
  monitor: Monitor,
  result: MonitorResult
) {
  let message: any
  if (type == 'Alert') {
    message = {
      text: `Monitor ${monitor.name} is down`,

      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Monitor <${getMonitorUrl(monitor)}|${monitor.name}> is down*`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*URL*\n${monitor.url}`,
            },
            {
              type: 'mrkdwn',
              text: `*Location*\n${result?.location}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `> Reason: \`${result.err}\``,
          },
        },
      ],
    }

    if (Array.isArray(result?.assertResults)) {
      result?.assertResults.map((res) => {
        if (res.fail)
          message['blocks'].push({
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `> *${res.type}* expected *${res.value}* but got *\`${res.fail}\`*`,
              },
            ],
          })
      })

      message['blocks'].push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<${getResponseUrl(result)}|See detailed response>`,
        },
      })
    }
  } else if (type == 'Recover') {
    //its recovery

    message = {
      text: `Monitor ${monitor.name} has recovered`,

      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Monitor <${getMonitorUrl(monitor)}|${monitor.name}> is up*`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*URL*\n${monitor.url}`,
            },
            {
              type: 'mrkdwn',
              text: `*Location*\n${result?.location}`,
            },
          ],
        },
      ],
    }

    if (result) {
      message['blocks'].push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<${process.env.WEB_APP_URL}/console/apiruns/${result.id}|See response>`,
        },
      })
    }
  }

  await got.post(channel.webhookUrl, {
    json: message,
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
    URL: ${monitor.url}
    Location: ${result.location}
    Error: ${result.err}
    ${formatAssertionResults(result)}
    Response: ${result.id}`
  } else if (type == 'Recover') {
    //its receovery
    message = `Monitor *${monitor.name}* has recovered\n
    URL: ${monitor.url}
    Location: ${result.location}
    Response: ${result.id}`
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
    message = `Monitor ${monitor.name} is down\n
    URL: ${monitor.url}
    Location: ${result.location}
    Status: ${result.err}
    ${formatAssertionResults(result)}
    \nResponse: ${getResponseUrl(result)}`
  } else if (type == 'Recover') {
    //its recovery
    message = `Monitor ${monitor.name} has recovered\n
    URL: ${monitor.url}
    Location: ${result.location}
    \nResponse: ${getResponseUrl(result)}`
  }
  sendNotificationEmail(channel.email, message)
}
