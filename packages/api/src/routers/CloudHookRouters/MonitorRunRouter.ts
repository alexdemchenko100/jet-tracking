import { FastifyInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import { JwksClient } from 'jwks-rsa'
import S from 'fluent-json-schema'
import { MonitorRunResult, MonitorRunResultSchema } from '@httpmon/db'
import Ajv from 'ajv'
import { runMonitor } from 'src/services/MonitorRunner'

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

const validateMonitorRunResult = new Ajv({ allErrors: true }).compile<MonitorRunResult>(
  MonitorRunResultSchema.valueOf()
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

export default async function MonitorRunRouter(app: FastifyInstance) {
  app.post<{ Body: PubsubMessage }>(
    '/',
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
      if (!verified) {
        app.log.error('error in verifying token')
        reply.code(200).send()
        return
      }

      const msg = req.body

      const buf = Buffer.from(msg.message.data, 'base64')
      const obj = JSON.parse(buf.toString())

      if (!validateMonitorRunResult(obj)) {
        app.log.error(
          validateMonitorRunResult.errors,
          'Monitor exec failed due to schema validation errors'
        )
        reply.code(200).send()
        return
      }

      const monrun = obj as MonitorRunResult

      app.log.info(`Exec monitor event: ${monrun.mon.name}`)

      try {
        await runMonitor(monrun)
      } catch (e) {
        app.log.error(e, 'Handle RunMonitor Failed')
      }
      reply.code(200).send()
    }
  )
}
