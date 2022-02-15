import { Generated, Kysely, PostgresDialect } from 'kysely'
import { Static, Type } from '@sinclair/typebox'

export const MonitorResultSchema = Type.Object({
  id: Type.Optional(Type.String()),
  createdAt: Type.Optional(Type.String()),
  err: Type.String(),
  body: Type.String(),
  bodySize: Type.Integer(),
  code: Type.Integer(),
  codeStatus: Type.String(),
  protocol: Type.String(),

  dnsLookupTime: Type.Integer(),
  tcpConnectTime: Type.Integer(),
  tlsHandshakeTime: Type.Integer(),
  timeToFirstByte: Type.Integer(),
  totalTime: Type.Integer(),
  certExpiryDays: Type.Integer(),
  certCommonName: Type.String(),
})

export type MonitorResult = Static<typeof MonitorResultSchema>

const emptyMonitorResultDTO: MonitorResult = {
  code: 0,
  codeStatus: '',
  body: '',
  bodySize: 0,
  protocol: '',
  dnsLookupTime: 0,
  tcpConnectTime: 0,
  tlsHandshakeTime: 0,
  timeToFirstByte: 0,
  totalTime: 0,
  certCommonName: '',
  certExpiryDays: 0,
  err: '',
}

interface MonitorResultTable {
  id: Generated<string>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  code: number
  codeStatus: string
  body: string
  bodySize: number
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

interface Database {
  MonitorResult: MonitorResultTable
}

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    host: 'localhost',
    database: 'mondb',
    user: 'postgres',
    password: 'postgres',
  }),
})
