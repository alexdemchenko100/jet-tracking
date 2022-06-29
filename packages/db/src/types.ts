import S from 'fluent-json-schema'
export type MonitorTuples = [string, string][]

export const MonitorTupleFluentSchema = S.array().items(
  S.array().items(S.string()).maxItems(2).minItems(2)
)

export const MonitorLocations = [
  { region: 'us-east1', name: 'S. Carolina', set: true },
  { region: 'europe-west3', name: 'Frankfurt', set: false },
  { region: 'asia-southeast1', name: 'Singapore', set: false },
]
const CloudRegions = MonitorLocations.map((location) => location.region)

const authTypes = ['basic', 'bearer']
export const MonitorAssertionResultFluentSchema = S.object()
  .prop('type', S.string())
  .required()
  .prop('op', S.string())
  .required()
  .prop('name', S.string())
  .prop('value', S.string())
  .required()
  .prop('fail', S.string())

export const MonitorResultFluentSchema = S.object()
  .prop('id', S.string())
  .prop('monitorId', S.string())
  .required()
  .prop('createdAt', S.string())
  .prop('err', S.string())
  .prop('url', S.string())
  .prop('ip', S.string())
  .prop('location', S.string())
  .enum(CloudRegions)
  .prop('body', S.string())
  .prop('bodySize', S.integer())
  .prop('codeStatus', S.string())
  .prop('protocol', S.string())
  .prop('code', S.integer())
  .prop('waitTime', S.integer())
  .prop('dnsTime', S.integer())
  .prop('tcpTime', S.integer())
  .prop('tlsTime', S.integer())
  .prop('uploadTime', S.integer())
  .prop('ttfb', S.integer())
  .prop('downloadTime', S.integer())
  .prop('totalTime', S.integer())
  .prop('certExpiryDays', S.integer())
  .prop('certCommonName', S.string())
  .prop('headers', MonitorTupleFluentSchema)
  .prop('assertResults', S.array().items(MonitorAssertionResultFluentSchema))

export const MonitorResultFluentSchemaArray = S.array().items(
  MonitorResultFluentSchema
)

export const MonitorResultQueryResponseSchema = S.object()
  .prop('items', MonitorResultFluentSchemaArray)
  .prop('totalItemCount', S.number())

export const MonitorResultStatsSchema = S.object()
  .prop('p95', S.number())
  .prop('p50', S.number())
  .prop('avg', S.number())
  .prop('numItems', S.number())
  .prop('numErrors', S.number())

export const StatsQueryStringSchema = S.object()
  .prop('startDate', S.string())
  .prop('endDate', S.string())
  .prop('location', S.string())

export const MonitorStatSummarySchema = S.object()
  .prop('monitorId', S.string())
  .prop('status', S.string())
  .prop('week', MonitorResultStatsSchema)
  .prop('day', MonitorResultStatsSchema)
  .prop(
    'lastResults',
    S.array().items(
      S.object()
        .prop('id', S.string())
        .prop('err', S.string())
        .prop('location', S.string())
        .prop('totalTime', S.number())
    )
  )

export type MonitorPeriodStats = {
  p95: number
  p50: number
  avg: number
  numItems: number
  numErrors: number
}

export type MonitorStats = {
  monitorId: string
  status: string
  week: MonitorPeriodStats
  day: MonitorPeriodStats
  lastResults: [
    {
      id: string
      err: string
      location: string
      totalTime: number
    }
  ]
}

export interface MonitorResultTable {
  id?: string
  createdAt?: String | Date
  monitorId: string
  accountId: string
  code: number
  codeStatus: string
  url: string
  ip: string
  location: string
  body: string
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

export type MonitorResultQuery = {
  items: MonitorResult[]
  totalItemCount?: number
}

export const MonitorAssertionsFluentSchema = S.array()
  .items(
    S.object()
      .prop('type', S.string())
      .required()
      .prop('name', S.string())
      .prop('op', S.string())
      .required()
      .prop('value', S.string())
      .required()
  )
  .minItems(0)

export const MonitorAuthFluentSchema = S.object()
  .prop('type', S.string().enum(['basic', 'bearer', 'none']))
  .prop(
    'basic',
    S.object()
      .prop('username', S.string())
      .required()
      .prop('password', S.string())
      .required()
  )
  .prop('bearer', S.object().prop('token', S.string()).required())

export const MonitorNotificationSchema = S.object()
  .prop('useGlobal', S.boolean().default(true))
  .prop('failCount', S.integer().minimum(0).maximum(10))
  .prop('failTimeMinutes', S.integer().enum(Object.values([0,5,10,15,20,30,60])))
  .prop(
    'channels',
    S.array().items(
      S.string()
    )
  )

export const MonitorFluentSchema = S.object()
  .prop('id', S.string())
  .prop('createdAt', S.string())
  .prop('name', S.string().required().minLength(1))
  .prop('status', S.string().default('active'))
  .prop('method', S.string().default('GET'))
  .prop('url', S.string().required())
  .prop('frequency', S.integer().minimum(10))
  .prop('auth', MonitorAuthFluentSchema)
  .prop('body', S.string())
  .prop('bodyType', S.string())
  .prop('preScript', S.string())
  .prop('headers', MonitorTupleFluentSchema)
  .prop('queryParams', MonitorTupleFluentSchema)
  .prop('locations', S.array().items(S.string().enum(CloudRegions)))
  .prop('cookies', S.anyOf([S.string(), S.null()]))
  .prop('followRedirects', S.integer())
  .prop('timeout', S.integer())
  .prop('env', MonitorTupleFluentSchema)
  .prop('assertions', MonitorAssertionsFluentSchema)
  .prop('notifications', MonitorNotificationSchema)

export type MonitorAssertion = {
  type: 'code' | 'totalTime' | 'certExpiryDays' | 'header' | 'body' | 'jsonBody'
  name?: string // contextual name: header name or jsonpath
  op: '=' | '!=' | '<' | '>' | 'contains' | 'matches'
  value: string
}

export type MonitorBasicAuth = {
  username: string
  password: string
}

export type MonitorBearerAuth = {
  token: string
}

export type MonitorAuth = {
  type?: 'basic' | 'bearer' | 'none'
  basic?: MonitorBasicAuth
  bearer?: MonitorBearerAuth
}

export type MontiorNotifyChannel = {
  type: string // email, slack, etc
  target: string // email address or slack channel etc
  info: string // email subject, slack channel, etc
}

export type MonitorNotifications = {
  useGlobal: boolean
  failCount?: number
  failTimeMinutes?: number
  channels: string[]
}

export type MonitorAssertionResult = MonitorAssertion & {
  fail?: string
}

export type MonitorRequest = {
  method: string
  url: string
  body?: string
  bodyType?: string
  auth?: MonitorAuth
  headers: Record<string, string>
  queryParams: Record<string, string>
}

export type MonitorTable = {
  id?: string
  createdAt?: string | Date
  accountId: string
  name: string
  status: string
  method: string
  url: string
  frequency: number
  body?: string
  bodyType?: string
  auth?: MonitorAuth
  preScript: string
  headers?: MonitorTuples
  locations?: string[]
  queryParams?: MonitorTuples
  cookies?: string
  followRedirects?: number
  timeout?: number
  assertions?: MonitorAssertion[]
  env?: MonitorTuples
  notifications?: MonitorNotifications
}

export type Monitor = MonitorTable

export type UserAccount = {
  id?: string
  createdAt?: string | Date
  userId: string
  email: string
  accountId: string
  role: string
  default: boolean
}

export type Account = {
  id?: string
  name: string
}

export type MonEnv = {
  id?: string
  createdAt?: string | Date
  accountId: string
  name: string
  env: MonitorTuples
}

export const EnvFluentSchema = S.object()
  .prop('name', S.string())
  .prop('id', S.string())
  .prop('env', MonitorTupleFluentSchema)

// export type EnvVariable = {
//   id?: string
//   createdAt?: string | Date
//   envId: string
//   key: string
//   value: string
//   meta: string
// }

export type SlackNotificationChannel = {
  webhookUrl: string
  type: 'slack'
}

export const SlackNotificationSchema = S.object()
  .prop('webhookUrl', S.string().required())
  .prop('type', S.string().enum(['slack']).required())

export type EmailNotificationChannel = {
  type: 'email'
  email: string // email string. Comma can be used for multi emails. Like this: 'email@test.com, email2@test.com'
  cc?: string // email string
  recipientName?: string // recipient's name
}

export const EmailNotificationSchema = S.object()
  .prop('email', S.string().required())
  .prop('cc', S.anyOf([S.string(), S.null()]))
  .prop('recipientName', S.anyOf([S.string(), S.null()]))
  .prop('type', S.string().enum(['email']).required())

export type MSTeamsNotificationChannel = {
  webhookUrl: string
  type: 'ms-teams'
}

export const MSTeamsNotificationSchema = S.object()
  .prop('webhookUrl', S.string().required())
  .prop('type', S.string().enum(['ms-teams']).required())

export type NotificationChannel = {
  id?: string
  accountId: string
  name: string  // notification name
  isDefaultEnabled: boolean
  applyOnExistingMonitors: boolean
  channel:
    | SlackNotificationChannel
    | EmailNotificationChannel
    | MSTeamsNotificationChannel
}

export const NotificationSchema = S.object()
  .prop('name', S.string().required())
  .prop('id', S.string())
  .prop('isDefaultEnabled', S.boolean().default(false))
  .prop('applyOnExistingMonitors', S.boolean().default(false))
  .prop('channel', S.anyOf([SlackNotificationSchema, EmailNotificationSchema, MSTeamsNotificationSchema]))

export type AlertSettings = {
  failCount: number // send notification after the number of failures
  failTimeMinutes: number // send notification after the number of minutes
}

export const AlertSettingsSchema = S.object()
  .prop('failCount', S.integer().minimum(0).maximum(10))
  .prop('failTimeMinutes', S.integer().enum(Object.values([0,5,10,15,20,30,60])))

export type Settings = {
  id?: string
  alert: AlertSettings
  accountId: string
}
  
export const SettingsSchema = S.object()
  .prop('id', S.string())
  .prop('alert', AlertSettingsSchema)
