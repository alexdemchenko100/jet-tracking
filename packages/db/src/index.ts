import { Insertable, Kysely, PostgresDialect, sql } from 'kysely'

import {
  Account,
  MonEnv,
  MonitorResultTable,
  MonitorTable,
  UserAccount,
  NotificationChannel,
  NotificationState,
  Settings,
  NotificationEmail,
} from './types'
export * from './types.js'

interface Database {
  MonitorResult: MonitorResultTable
  Monitor: MonitorTable
  UserAccount: UserAccount
  Account: Account
  MonEnv: MonEnv
  NotificationChannel: NotificationChannel
  NotificationState: NotificationState
  Settings: Settings
  NotificationEmail: NotificationEmail
}

import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '../..', '.env') })

let config: { [key: string]: string | number | undefined } = {}

if (process.env.DATABASE_URL) {
  config['connectionString'] = process.env.DATABASE_URL
} else {
  config['host'] = process.env.DB_HOST
  config['port'] = Number(process.env.DB_PORT)
  config['user'] = process.env.DB_USER
  config['password'] = process.env.DB_PASSWORD
  config['database'] = process.env.DB_NAME
}

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    ...config,
  }),
})

function objectToJSON(object: any) {
  if (typeof object == 'string') {
    return object
  } else if (typeof object == 'object') {
    return JSON.stringify(object)
  }
  throw Error('Cannot convert to JSON')
}

export async function saveMonitorResult(result: Insertable<MonitorResultTable>) {
  //Handle all JSON conversions here.. headers, cookies, variables etc
  let resultForSaving = {
    ...result,
    headers: objectToJSON(result.headers),
  }

  if (result.assertResults) {
    resultForSaving = {
      ...resultForSaving,
      assertResults: objectToJSON(result.assertResults),
    }
  }

  try {
    return await db
      .insertInto('MonitorResult')
      .values(resultForSaving)
      .returningAll()
      .executeTakeFirst()
  } catch (e) {
    console.log('exception: ', e)
    return null
  }
}
