import { execMonitor } from '../../services/MonitorExecutor'
import { FastifyInstance } from 'fastify'
import { Monitor, MonitorFluentSchema, MonitorResultFluentSchema } from '@httpmon/db'
import { processAssertions } from '../../services/Assertions'

export default async function OndemandMonitorRouter(app: FastifyInstance) {
  app.post<{ Body: Monitor }>(
    '/exec',
    {
      schema: {
        body: MonitorFluentSchema,
        response: {
          200: MonitorResultFluentSchema,
        },
      },
    },
    async function (req, reply) {
      const mon = req.body
      req.log.info('exec ondemand')

      const result = await execMonitor(mon)
      const asserionResults = processAssertions(mon, result)
      result.assertResults = asserionResults
      if (!result.err) result.err = asserionResults.some((a) => a.fail) ? 'assertions failed' : ''

      reply.code(200).send(result)
    }
  )
}
