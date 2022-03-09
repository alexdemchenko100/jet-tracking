import { Type } from '@sinclair/typebox'

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

export const MonitorSchema = Type.Object({
  id: Type.Optional(Type.String()),
  createdAt: Type.Optional(Type.String()),
  name: Type.String({ minLength: 2 }),
  status: Type.String({ default: 'active' }),
  method: Type.String({ default: 'GET' }),
  url: Type.String(),
  frequency: Type.Integer({ minimum: 10 }),
  body: Type.Optional(Type.String()),
  bodyType: Type.Optional(Type.String()),
  headers: Type.Optional(MonitorTupleSchema),
  queryParams: Type.Optional(MonitorTupleSchema),
  cookies: Type.Optional(Type.String()),
  assertions: Type.Optional(Type.Array(MonitorAssertionSchema)),
  followRedirects: Type.Optional(Type.Integer()),
  timeout: Type.Optional(Type.Integer()),
  notifyEmail: Type.Optional(Type.String()),
  env: Type.Optional(MonitorTupleSchema),
})

//export type MonitorDTO = Static<typeof MonitorSchema>

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
  queryParams?: MonitorTuples
  cookies?: string
  followRedirects?: number
  timeout?: number
  assertions?: MonitorAssertion[]
  notifyEmail?: string
  env?: MonitorTuples
}

export type Monitor = MonitorTable
