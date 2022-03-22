import { FastifyInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import { JwksClient } from 'jwks-rsa'
import S from 'fluent-json-schema'
import { Monitor, MonitorFluentSchema } from '@httpmon/db'
import Ajv from 'ajv'
import { execMonitor } from 'src/services/monitor-exec'
import { processAssertions } from 'src/services/assertions'
import { saveMonitorResult } from '@httpmon/db'

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

const validateMonitor = new Ajv({ allErrors: true }).compile<Monitor>(
  MonitorFluentSchema.valueOf()
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

export default async function MonitorExecutorRouter(app: FastifyInstance) {
  app.post<{ Body: PubsubMessage }>(
    '/monitor',
    {
      schema: {
        body: PubsubMessageSchema,
      },
    },
    async function (req, reply) {
      //remember, we always send 200 to denote that message is processed
      //otw, pubsub will keep retrying to send the message

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

      const msg = req.body

      const monitorBuf = Buffer.from(msg.message.data, 'base64')
      const monitorObj = JSON.parse(monitorBuf.toString())

      const valid = validateMonitor(monitorObj)
      console.log(monitorObj)
      console.log(valid)

      if (!validateMonitor(monitorObj)) {
        app.log.error(validateMonitor.errors, 'schema err')
        reply.code(200).send()
        return
      }

      const monitor = monitorObj as Monitor

      app.log.info(monitor.name, 'exec-monitor-name')

      const result = await execMonitor(monitor)

      if (result.err == '') {
        const asserionResults = processAssertions(monitor, result)
        result.assertResults = asserionResults
        result.err = asserionResults.some((a) => a.fail)
          ? 'assertions failed'
          : ''
      }

      app.log.info(result.code, 'exec-monitor-result-code')
      app.log.info(result.totalTime, 'exec-monitor-result-time')

      //createdAt caused type issue for db
      await saveMonitorResult({ ...result })

      reply.code(200).send()
    }
  )
}
