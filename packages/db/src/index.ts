import { Generated, Insertable, Kysely, PostgresDialect, sql } from 'kysely'
import { Static, Type } from '@sinclair/typebox'

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

interface MonitorResultTable {
  id: Generated<string>
  monitorId: string
  createdAt: Generated<Date>
  code: number
  codeStatus: string
  body: string
  bodyJson?: object
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

export const MonitorSchema = Type.Object({
  id: Type.Optional(Type.String()),
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
  assertions: Type.Optional(Type.String()),
  notifyEmail: Type.Optional(Type.String()),
  env: Type.Optional(Type.String()),
})

export type MonitorDTO = Static<typeof MonitorSchema>

interface MonitorTable {
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
  assertions?: string
  notifyEmail?: string
  env?: string
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
  // let's get to the closed 10 second using floor.
  // This helps when doing modulo math to figure out if a monitor is a hit to schedule
  const seconds =
    Math.floor((now.getMinutes() * 60 + now.getSeconds()) / 10) * 10

  const resp = await db
    .selectFrom('Monitor')
    .selectAll()
    .where('status', '=', 'active')
    .where(sql`${seconds.toString()} % frequency`, '=', 0)
    .execute()

  return resp
}
