import S from 'fluent-json-schema'

export const ParamsSchema = S.object().prop('id', S.string())
export type Params = {
  id: string
}
export const NotificationEmailsParamsSchema = S.object().prop('status', S.string())
export type NotificationEmailsParams = {
  status: string
}
