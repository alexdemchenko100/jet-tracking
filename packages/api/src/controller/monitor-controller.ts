import { execMonitor } from './../services/httpstats.js'
import { MonitorService } from './../services/monitor-service.js'
import { FastifyInstance } from 'fastify'
import { Static, Type } from '@sinclair/typebox'
import {
  Monitor,
  MonitorResultSchema,
  MonitorSchema,
  MonitorTuples,
} from '@httpmon/db'

export default async function MonitorController(app: FastifyInstance) {
  const monitorSvc = MonitorService.getInstance()

  app.post<{ Body: Monitor }>(
    '/',
    {
      schema: {
        body: MonitorSchema,
        response: {
          200: MonitorSchema,
        },
      },
    },
    async function (req, reply) {
      const mon = req.body

      const resp = await monitorSvc.create(mon)

      reply.send(resp)
    }
  )

  app.get(
    '/',
    {
      schema: {
        response: {},
      },
    },
    async function (_, reply) {
      const resp = await monitorSvc.list()

      reply.send(resp)
    }
  )

  const ParamsSchema = Type.Object({ id: Type.String() })
  type Params = Static<typeof ParamsSchema>

  app.get<{ Params: Params }>(
    '/:id',
    {
      schema: {
        params: ParamsSchema,
        response: { 200: MonitorSchema },
      },
    },
    async function ({ params: { id } }, reply) {
      const mon = await monitorSvc.find(id)
      if (mon) {
        reply.send(mon)
      } else {
        reply.code(404).send('Not found')
      }
    }
  )

  app.get<{ Params: Params }>(
    '/:id/results',
    {
      schema: {
        params: ParamsSchema,
        response: { 200: Type.Array(MonitorResultSchema) },
      },
    },
    async function ({ params: { id } }, reply) {
      const mon = await monitorSvc.getMonitorResults(id)
      if (mon) {
        reply.send(mon)
      } else {
        reply.code(404).send('Not found')
      }
    }
  )

  app.post<{ Body: MonitorTuples; Params: Params }>(
    '/:id/env',
    {
      schema: {
        params: ParamsSchema,
        // response: { 200: Type.Array(MonitorResultSchema) },
      },
    },
    async function (req, reply) {
      await monitorSvc.setEnv(req.params.id, req.body)
      reply.send('env set')
    }
  )

  app.post<{ Body: Monitor }>(
    '/ondemand',
    {
      schema: {
        body: MonitorSchema,
        // response: {
        //   200: MonitorResultSchema,
        // },
      },
    },
    async function (req, reply) {
      const mon = req.body

      const resp = await execMonitor(mon)

      reply.send(resp)
    }
  )
}
