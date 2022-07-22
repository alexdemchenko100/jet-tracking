import { ActivityLogService } from '../../services/ActivityLogService'
import { FastifyInstance } from 'fastify'
import {
  PaginateQueryStringSchema,
  NotificationState,
  PaginateQueryString,
  ActivityLogsResponseSchema,
  NotificationStateSchema,
} from '@httpmon/db'
import { onRequestAuthHook } from '../RouterHooks'

export default async function ActivityLogRouter(app: FastifyInstance) {
  app.addHook('onRequest', onRequestAuthHook)

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
