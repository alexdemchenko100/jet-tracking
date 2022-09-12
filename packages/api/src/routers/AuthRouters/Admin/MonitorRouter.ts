import { FastifyInstance } from 'fastify'
import S from 'fluent-json-schema'
import {
  Monitor,
  MonitorFluentSchema,
  MonitorResultFluentSchemaArray,
  MonitorTuples,
} from '@httpmon/db'
import { onRequestAuthHook, onAdminRequestAuthHook } from '../../RouterHooks'
import { MonitorService } from '../../../services/MonitorService'

export default async function MonitorRouter(app: FastifyInstance) {
  app.addHook('onRequest', onRequestAuthHook)
  app.addHook('onRequest', onAdminRequestAuthHook)

  const monitorSvc = MonitorService.getInstance()

  app.put<{ Body: Monitor }>(
    '/',
    {
      schema: {
        body: MonitorFluentSchema,
        response: {
          200: MonitorFluentSchema,
        },
      },
    },
    async function ({ body, log }, reply) {
      try {
        const resp = await monitorSvc.create(body)
        log.info(`Creating monitor: ${resp?.id}`)

        reply.send(resp)
      } catch (error) {
        if (error.message === 'Monitor_name_accountId_key') {
          reply
            .status(400)
            .send({ message: 'Monitor with the same name already exists. Please use another name' })
        }
      }
    }
  )

  const ParamsSchema = S.object().prop('id', S.string())
  type Params = {
    id: string
  }

  app.post<{ Params: Params; Body: Monitor }>(
    '/:id',
    {
      schema: {
        params: ParamsSchema,
        body: MonitorFluentSchema,
        response: {
          200: MonitorFluentSchema,
        },
      },
    },
    async function ({ params: { id }, body: monitor, log }, reply) {
      if (id != monitor.id) {
        reply.code(400).send('Monitor id is not valid')
        return
      }
      const resp = await monitorSvc.update(monitor)
      log.info(`Updating monitor: ${monitor.id}`)

      reply.send(resp)
    }
  )

  app.delete<{ Params: Params }>(
    '/:id',
    {
      schema: {
        params: ParamsSchema,
        response: {
          200: MonitorFluentSchema,
        },
      },
    },
    async function ({ params: { id }, log }, reply) {
      const resp = await monitorSvc.delete(id)
      log.info(`Deleted monitor id: ${id}`)
      reply.send(resp)
    }
  )

  app.post<{ Body: MonitorTuples; Params: Params }>(
    '/:id/env',
    {
      schema: {
        params: ParamsSchema,
        response: { 200: MonitorResultFluentSchemaArray },
      },
    },
    async function (req, reply) {
      await monitorSvc.setVariables(req.params.id, req.body)
      reply.send('env variables set')
    }
  )
}
