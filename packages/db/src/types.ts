import { Static, Type } from '@sinclair/typebox'
import { Generated } from 'kysely'

type HeaderArray = [string, string][]

export const MonitorHeaderSchema = Type.Array(
  Type.Tuple([Type.String(), Type.String()])
)

export const MonitorResultSchema = Type.Object({
  id: Type.Optional(Type.String()),
  monitorId: Type.String(),
  createdAt: Type.Optional(Type.String()),
  err: Type.String(),
  body: Type.String(),
  bodyJson: Type.Optional(Type.String()),
  bodySize: Type.Integer(),
  code: Type.Integer(),
  codeStatus: Type.String(),
  protocol: Type.String(),
  headers: MonitorHeaderSchema,
  dnsLookupTime: Type.Integer(),
  tcpConnectTime: Type.Integer(),
  tlsHandshakeTime: Type.Integer(),
  timeToFirstByte: Type.Integer(),
  totalTime: Type.Integer(),
  certExpiryDays: Type.Integer(),
  certCommonName: Type.String(),
})

//export type MonitorResult = Static<typeof MonitorResultSchema>

export interface MonitorResultTable {
  id?: string
  createdAt?: String | Date
  monitorId: string
  code: number
  codeStatus: string
  body: string
  bodyJson?: object | string
  bodySize: number
  headers: HeaderArray | string
  protocol: string
  dnsLookupTime: number
  tcpConnectTime: number
  tlsHandshakeTime: number
  timeToFirstByte: number
  totalTime: number
  certCommonName: string
  certExpiryDays: number
  err: string
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
  url: Type.String({ format: 'url' }),
  frequency: Type.Integer(),
  body: Type.Optional(Type.String()),
  bodyType: Type.Optional(Type.String()),
  headers: Type.Optional(MonitorHeaderSchema),
  queryParams: Type.Optional(Type.String()),
  cookies: Type.Optional(Type.String()),
  assertions: Type.Optional(Type.Array(MonitorAssertionSchema)),
  followRedirects: Type.Optional(Type.Integer()),
  timeout: Type.Optional(Type.Integer()),
  notifyEmail: Type.Optional(Type.String()),
  env: Type.Optional(Type.String()),
})

//export type MonitorDTO = Static<typeof MonitorSchema>

export type MonitorAssertion = {
  key: string
  name?: string
  op: string // =, <, >, <=, <=, contains
  value: string
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
  headers?: HeaderArray | string
  queryParams?: string
  cookies?: string
  followRedirects?: number
  timeout?: number
  assertions?: MonitorAssertion[]
  notifyEmail?: string
  env?: string
}

export type Monitor = MonitorTable
