import { Generated, Insertable, Kysely, PostgresDialect } from 'kysely'
import { Static, Type } from '@sinclair/typebox'

export const MonitorResultSchema = Type.Object({
  id: Type.Optional(Type.String()),
  monitorId: Type.String(),
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

interface MonitorResultTable {
  id: Generated<string>
  monitorId: string
  createdAt: Generated<Date>
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

export const MonitorSchema = Type.Object({
  id: Type.Optional(Type.String()),
  createdAt: Type.Optional(Type.String()),
  name: Type.String({ minLength: 2 }),
  url: Type.String({ format: 'url' }),
  method: Type.String(),
  body: Type.String(),
  frequency: Type.Integer(),
  headers: Type.String({ default: '' }),
  queryParams: Type.String({ default: '' }),
  cookies: Type.String({ default: '' }),
  status: Type.String(),
})

export type MonitorDTO = Static<typeof MonitorSchema>

interface MonitorTable {
  id: string
  createdAt: string | Date
  updatedAt: string | Date
  name: string
  status: string
  url: string
  method: string
  body: string
  frequency: number
  headers: string
  queryParams: string
  cookies: string
}

interface Database {
  MonitorResult: MonitorResultTable
  Monitor: MonitorTable
}

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    host: 'localhost',
    database: 'mondb',
    user: 'postgres',
    password: 'postgres',
  }),
})

export async function saveMonitorResult(
  result: Insertable<MonitorResultTable>
) {
  try {
    await db.insertInto('MonitorResult').values(result).execute()
  } catch (e) {
    console.log('exception: ', e)
  }
}

export async function selectReadyMonitors() {
  const now = new Date(Date.now())
  const seconds =
    Math.floor((now.getMinutes() * 60 + now.getSeconds()) / 10) * 10

  const resp = await db
    .selectFrom('Monitor')
    .selectAll()
    .where('status', '=', 'active')
    .where(db.raw(seconds.toString() + '% frequency'), '=', 0)
    .execute()

  return resp
}
