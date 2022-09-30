import { FastifyInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import { JwksClient } from 'jwks-rsa'
import S from 'fluent-json-schema'
import { Monitor, MonitorFluentSchema } from '@httpmon/db'
import Ajv from 'ajv'
import { handlePreRequest } from 'src/services/PreRequestService'

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

const validateMonitor = new Ajv({ allErrors: true }).compile<Monitor>(MonitorFluentSchema.valueOf())
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

export default async function MonitorPreRequestRouter(app: FastifyInstance) {
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

      if (!validateMonitor(obj)) {
        app.log.error(validateMonitor.errors, 'Monitor exec failed due to schema validation errors')
        reply.code(200).send()
        return
      }

      const monitor = obj as Monitor

      app.log.info(`Setup monitor event: ${monitor.name}`)

      try {
        await handlePreRequest(monitor)
      } catch (e: any) {
        app.log.error(e, `error in handling PreRequest`)
      }
      reply.code(200).send()
    }
  )
}
