import { Static, Type } from '@sinclair/typebox'
import { Generated } from 'kysely'

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
  headers: Type.String(),
  dnsLookupTime: Type.Integer(),
  tcpConnectTime: Type.Integer(),
  tlsHandshakeTime: Type.Integer(),
  timeToFirstByte: Type.Integer(),
  totalTime: Type.Integer(),
  certExpiryDays: Type.Integer(),
  certCommonName: Type.String(),
})

export type MonitorResult = Static<typeof MonitorResultSchema>

export interface MonitorResultTable {
  id: Generated<string>
  monitorId: string
  createdAt: Generated<Date>
  code: number
  codeStatus: string
  body: string
  bodyJson?: object | string
  bodySize: number
  headers: string
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

export const MonitorAssertionSchema = Type.Array(
  Type.Object({
    key: Type.String(),
    name: Type.Optional(Type.String()),
    op: Type.String(),
    value: Type.String(),
  })
)

export const MonitorSchema = Type.Object({
  id: Type.Optional(Type.String()),
  //assertions: Type.Array(MonitorAssertionSchema),
  assertions: Type.Any(),
  createdAt: Type.Optional(Type.String()),
  name: Type.String({ minLength: 2 }),
  status: Type.Optional(Type.String()),
  method: Type.Optional(Type.String()),
  url: Type.String({ format: 'url' }),
  frequency: Type.Integer(),
  body: Type.Optional(Type.String()),
  bodyType: Type.Optional(Type.String()),
  headers: Type.Optional(Type.String()),
  queryParams: Type.Optional(Type.String()),
  cookies: Type.Optional(Type.String()),
  followRedirects: Type.Optional(Type.Integer()),
  timeout: Type.Optional(Type.Integer()),
  notifyEmail: Type.Optional(Type.String()),
  env: Type.Optional(Type.String()),
})

export type MonitorDTO = Static<typeof MonitorSchema>

export interface MonitorAssertion {
  key: string
  name?: string
  op: string // =, <, >, <=, <=, contains
  value: string
}

export interface MonitorTable {
  id: string
  createdAt: string | Date
  name: string
  status: string
  method: string
  url: string
  frequency: number
  body?: string
  bodyType?: string
  headers?: string
  queryParams?: string
  cookies?: string
  followRedirects?: number
  timeout?: number
  assertions?: MonitorAssertion[]
  notifyEmail?: string
  env?: string
}
