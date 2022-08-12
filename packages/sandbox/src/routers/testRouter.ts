import { FastifyInstance } from 'fastify'
import { MonitorRunResult, MonitorRunResultSchema } from '@httpmon/db'
import Ajv from 'ajv'
import { execPreScript } from '../services/PreScriptService'

const validateMonitorRunResult = new Ajv({ allErrors: true }).compile<MonitorRunResult>(
  MonitorRunResultSchema.valueOf()
)

export default async function testRouter(app: FastifyInstance) {
  app.post<{ Body: MonitorRunResult }>(
    '/',
    {
      schema: {},
    },
    async function (req, reply) {
      //remember, we always send 200 to denote that message is processed
      //otw, pubsub will keep retrying to send the message

      const msg = req.body

      if (!validateMonitorRunResult(msg)) {
        app.log.error(
          validateMonitorRunResult.errors,
          'Monitor exec failed due to schema validation errors'
        )
        reply.code(200).send()
        return
      }

      const monrun = msg as MonitorRunResult

      app.log.info(`monitor prerequest event: ${monrun.mon.name}`)

      const resp = await execPreScript(monrun)
      reply.code(200).send(resp)
    }
  )
}
