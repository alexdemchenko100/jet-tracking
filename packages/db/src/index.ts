import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'

import {
  Account,
  MonEnv,
  MonitorResultTable,
  MonitorTable,
  UserAccount,
  NotificationChannel,
  NotificationState,
  Settings,
  StatusPage,
  BillingInfo,
  ApiKey,
} from './types'
export * from './types.js'

interface Database {
  Account: Account
  UserAccount: UserAccount
  MonitorResult: MonitorResultTable
  Monitor: MonitorTable
  MonEnv: MonEnv
  NotificationChannel: NotificationChannel
  NotificationState: NotificationState
  Settings: Settings
  StatusPage: StatusPage
  BillingInfo: BillingInfo
  ApiKey: ApiKey
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
    pool: new Pool({
      ...config,
    }),
  }),
})
