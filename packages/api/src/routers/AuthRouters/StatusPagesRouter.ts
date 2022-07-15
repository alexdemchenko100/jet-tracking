import { FastifyInstance } from 'fastify'
import S from 'fluent-json-schema'
import { StatusPage, StatusPageSchema } from '@httpmon/db'
import { Params, ParamsSchema } from '../../types'
import { onRequestAuthHook } from '../RouterHooks'
import { StatusPageService } from '../../services/StatusPageService'

export default async function StatusPagesRouter(app: FastifyInstance) {
  app.addHook('onRequest', onRequestAuthHook)

  const statusPageService = StatusPageService.getInstance()

  // GET /
  app.get(
    '/',
    {
      schema: {
        response: {
          200: S.array().items(StatusPageSchema),
        },
      },
    },
    async function (req, reply) {
      const resp = await statusPageService.listStatusPages()
      req.log.info(`List statusPages: ${JSON.stringify(resp)}`)
      reply.send(resp)
    }
  )

  // POST /
  app.post<{ Body: StatusPage }>(
    '/',
    {
      schema: {
        body: StatusPageSchema,
        response: {
          201: StatusPageSchema,
        },
      },
    },
    async function (req, reply) {
      const data = req.body

      const resp = await statusPageService.newStatusPage(data)
      req.log.info(`Creating new statusPage: ${resp?.id}`)
      reply.send(resp)
    }
  )

  // GET /
  app.get<{ Params: Params }>(
    '/:id',
    {
      schema: {
        params: ParamsSchema,
        body: S.number(),
      },
    },
    async function ({ params: { id }, log }, reply) {
      const resp = await statusPageService.getStatusPage(id)
      log.info(resp, `Get statusPage id: ${id}`)
      reply.send(resp)
    }
  )

  // PUT /
  app.put<{ Body: StatusPage; Params: Params }>(
    '/:id',
    {
      schema: {
        params: ParamsSchema,
        body: StatusPageSchema,
        response: {
          200: StatusPageSchema,
        },
      },
    },
    async function ({ body, params: { id }, log }, reply) {
      const resp = await statusPageService.updateStatusPage(id, body)
      log.info(`Updating statusPage id: ${id}`)
      reply.send(resp)
    }
  )

  // DELETE /:id
  app.delete<{ Params: Params }>(
    '/:id',
    {
      schema: {
        params: ParamsSchema,
        body: S.number(),
      },
    },
    async function ({ params: { id }, log }, reply) {
      const resp = await statusPageService.deleteStatusPage(id)
      log.info(resp, `Deleted statusPage id: ${id}`)
      reply.send(resp)
    }
  )
}
