import { Type } from '@sinclair/typebox'
import S from 'fluent-json-schema'
export type MonitorTuples = [string, string][]

export const MonitorTupleSchema = Type.Array(
  Type.Tuple([Type.String(), Type.String()])
)

export const MonitorAssertionResultSchema = Type.Object({
  key: Type.String(),
  name: Type.Optional(Type.String()),
  op: Type.String(),
  value: Type.String(),
  passed: Type.Boolean(),
  result: Type.String(),
})

export const MonitorResultSchema = Type.Object({
  id: Type.Optional(Type.String()),
  monitorId: Type.String(),
  createdAt: Type.Optional(Type.String()),
  err: Type.String(),
  url: Type.String(),
  ip: Type.String(),
  body: Type.String(),
  bodyJson: Type.Optional(Type.String()),
  bodySize: Type.Integer(),
  code: Type.Integer(),
  codeStatus: Type.String(),
  protocol: Type.String(),
  headers: MonitorTupleSchema,
  waitTime: Type.Integer(),
  dnsTime: Type.Integer(),
  tcpTime: Type.Integer(),
  tlsTime: Type.Integer(),
  uploadTime: Type.Integer(),
  ttfb: Type.Integer(),
  downloadTime: Type.Integer(),
  totalTime: Type.Integer(),
  certExpiryDays: Type.Integer(),
  certCommonName: Type.String(),
  assertResults: Type.Optional(Type.Array(MonitorAssertionResultSchema)),
})

export const MonitorResultSchemaArray = Type.Array(MonitorResultSchema)
//export type MonitorResult = Static<typeof MonitorResultSchema>

export interface MonitorResultTable {
  id?: string
  createdAt?: String | Date
  monitorId: string
  code: number
  codeStatus: string
  url: string
  ip: string
  body: string
  bodyJson?: object | string
  bodySize: number
  headers: MonitorTuples | string
  protocol: string
  waitTime: number
  dnsTime: number
  tcpTime: number
  tlsTime: number
  uploadTime: number
  ttfb: number
  downloadTime: number
  totalTime: number
  certCommonName: string
  certExpiryDays: number
  err: string
  assertResults?: MonitorAssertionResult[] | string
}

export type MonitorResult = MonitorResultTable

export const MonitorAssertionSchema = Type.Object({
  key: Type.String(),
  name: Type.Optional(Type.String()),
  op: Type.String(),
  value: Type.String(),
})

export const MonitorTupleFluentSchema = S.array().items(
  S.array().minItems(2).maxItems(2)
)

export const MonitorFluentSchema = S.object()
  .prop('id', S.string())
  .prop('createdAt', S.string())
  .prop('name', S.string().required().minLength(1))
  .prop('status', S.string().default('active'))
  .prop('method', S.string().default('GET'))
  .prop('url', S.string().required())
  .prop('frequency', S.integer().minimum(10))
  .prop('body', S.string())
  .prop('bodyType', S.string())
  .prop('headers', MonitorTupleFluentSchema)
  .prop('queryParams', MonitorTupleFluentSchema)
  .prop('locations', S.array().items(S.string()))
  .prop('cookies', S.string())
  .prop('followRedirects', S.integer())
  .prop('timeout', S.integer())
  .prop('notifyEmail', S.string())
  .prop('env', MonitorTupleFluentSchema)

export type MonitorAssertion = {
  key: string
  name?: string
  op: string // =, <, >, <=, <=, contains
  value: string
}

export type MonitorAssertionResult = {
  key: string
  name?: string
  op: string // =, <, >, <=, <=, contains
  value: string
  passed: boolean
  result: string
}

export type MonitorTable = {
  id?: string
  createdAt?: string | Date
  name: string
  status: string
  method: string
  url: string
  frequency: number
  body?: string
  bodyType?: string
  headers?: MonitorTuples
  locations?: string[]
  queryParams?: MonitorTuples
  cookies?: string
  followRedirects?: number
  timeout?: number
  assertions?: MonitorAssertion[]
  notifyEmail?: string
  env?: MonitorTuples
}

export type Monitor = MonitorTable
