import { FastifyInstance } from 'fastify'
import { Monitor, MonitorFluentSchema, MonitorResult, MonitorResultFluentSchema } from '@httpmon/db'
import { onRequestAuthHook } from '../RouterHooks'
import { v4 as uuidv4 } from 'uuid'
import { runOndemand } from 'src/services/OndemandService'
import { logger } from 'src/Context'

export default async function OndemandMonitorRouter(app: FastifyInstance) {
  app.addHook('onRequest', onRequestAuthHook)

  app.post<{ Body: Monitor }>(
    '/run',
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

      //lets give the monitor an id
      mon.status = 'ondemand' //this identifies ondemand monitor

      try {
        let resp = await runOndemand(mon)

        reply.code(200).send(resp)
      } catch (e) {
        let errResult = e as MonitorResult
        if (errResult?.err && errResult?.monitorId) {
          reply.code(200).send(e)
        } else {
          reply.code(400).send(e)
        }
      }
    }
  )
}
