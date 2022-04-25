import { db, Monitor } from '@httpmon/db'
import { FastifyInstance } from 'fastify'
import { sql } from 'kysely'
import { PubSub } from '@google-cloud/pubsub'
import { JwksClient } from 'jwks-rsa'
import jwt from 'jsonwebtoken'
import S from 'fluent-json-schema'
import { logger } from '../Context'

const PubsubMessageSchema = S.object()
  .prop('subscription', S.string())
  .required()
  .prop(
    'message',
    S.object()
      .prop('attributes', S.object())
      .prop('data', S.string())
      .required()
      .prop('messageId', S.string())
      .prop('publishTime', S.string())
  )

type PubsubMessage = {
  subscription: string
  message: {
    data: string
    messageId: string
    publishTime: string
  }
}

var client = new JwksClient({
  jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
})

const pubsub = new PubSub({ projectId: 'httpmon-test' })

const topicName = 'httpmon-test-monitor-' //process.env.TOPIC_NAME

async function publishMonitorMessage(mon: Monitor) {
  if (!mon.locations || mon.locations.length < 1) return

  mon.locations.forEach(async (loc) => {
    const TOPIC_NAME = `${topicName}${loc}`
    try {
      await pubsub.topic(TOPIC_NAME).publishMessage({ json: mon })
    } catch (error) {
      logger.error(
        `Received error while publishing to ${TOPIC_NAME} - ${error.message}`
      )
    }
  })
}

export default async function SchedulerRouter(app: FastifyInstance) {
  app.post<{ Body: PubsubMessage }>(
    '/',
    {
      schema: {
        body: PubsubMessageSchema,
      },
    },
    async function (req, reply) {
      //remember, we always send 200 to denote that message is processed
      //otw, pubsub keeps retrying to send the message

      const authorization = req.headers.authorization as string
      const [bearer = '', token] = authorization.split(' ')
      if (bearer.trim().toLowerCase() !== 'bearer') {
        app.log.error('error in parsing auth header')
        reply.code(200).send()
        return
      }

      const decoded = jwt.decode(token, { complete: true })

      const kid = decoded?.header.kid
      const key = await client.getSigningKey(kid)
      const signingKey = key.getPublicKey()
      const verified = jwt.verify(token, signingKey)

      if (!verified) {
        app.log.error('unverfied scheduler message')
        reply.code(200).send()
        return
      }

      const msg: PubsubMessage = req.body

      const scheduleTime = new Date(msg.message.publishTime)

      // // let's get to the closest 10 second using floor.
      // // This helps when doing modulo math to figure out if a monitor is a hit to schedule
      const seconds = scheduleTime.getMinutes() * 60

      const monitors = await db
        .selectFrom('Monitor')
        .selectAll()
        .where('status', '=', 'active')
        .where(sql`${seconds} % frequency`, '=', 0)
        .execute()

      app.log.info(`Schedler Event: exec ${monitors.length} monitors`)

      try {
        monitors.forEach((mon) => {
          publishMonitorMessage(mon)
        })
      } catch (e: any) {
        app.log.error(`monitor exec failed: ${e.toString()}`)
      }

      reply.code(200).send()
    }
  )
}
