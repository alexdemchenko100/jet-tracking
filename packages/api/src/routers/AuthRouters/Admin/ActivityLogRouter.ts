import { FastifyInstance } from 'fastify'
import {
  PaginateQueryStringSchema,
  PaginateQueryString,
  ActivityLogsResponseSchema,
} from '@httpmon/db'
import { onRequestAuthHook, onAdminRequestAuthHook } from '../../RouterHooks'
import { ActivityLogService } from '../../../services/ActivityLogService'

export default async function ActivityLogRouter(app: FastifyInstance) {
  app.addHook('onRequest', onRequestAuthHook)
  app.addHook('onRequest', onAdminRequestAuthHook)

  const activityLogService = ActivityLogService.getInstance()

  app.get<{ Querystring: PaginateQueryString }>(
    '/',
    {
      schema: {
        querystring: PaginateQueryStringSchema,
        response: { 200: ActivityLogsResponseSchema },
      },
    },
    async function ({ query: { limit, offset } }, reply) {
      const resp = await activityLogService.listLogs(offset, limit)
      reply.send(resp)
    }
  )
}
