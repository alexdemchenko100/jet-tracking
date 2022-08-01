import { MonitorStatSummarySchema } from '@httpmon/db'
import S from 'fluent-json-schema'

export const ParamsSchema = S.object().prop('id', S.string())
export type Params = {
  id: string
}
export const NotificationEmailsParamsSchema = S.object().prop('status', S.string())
export type NotificationEmailsParams = {
  status: string
}

export const PublicStatusPageSchema = S.object()
  .prop('id', S.string())
  .prop('createdAt', S.string())
  .prop('accountId', S.string())
  .prop('name', S.string())
  .prop('url', S.string())
  .prop('logoUrl', S.string())
  .prop('siteUrl', S.string())
  .prop('monitors', S.array().items(MonitorStatSummarySchema))
