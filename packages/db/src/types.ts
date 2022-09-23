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

export const MonitorResultFluentSchemaArray = S.array().items(MonitorResultFluentSchema)

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

export const PaginateQueryStringSchema = S.object()
  .prop('limit', S.number())
  .prop('offset', S.number())

export const MonitorStatSummarySchema = S.object()
  .prop('monitorId', S.string())
  .prop('monitorName', S.string())
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
    S.object().prop('username', S.string()).required().prop('password', S.string()).required()
  )
  .prop('bearer', S.object().prop('token', S.string()).required())

export const MonitorNotificationSchema = S.object()
  .prop('useGlobal', S.boolean().default(true))
  .prop('failCount', S.integer().minimum(0).maximum(10))
  .prop('failTimeMinutes', S.integer().enum(Object.values([0, 5, 10, 15, 20, 30, 60])))
  .prop('channels', S.array().items(S.string()))

export const MonitorFluentSchema = S.object()
  .prop('id', S.string())
  .prop('createdAt', S.string())
  .prop('name', S.string().required().minLength(1))
  .prop('status', S.string().default('active'))
  .prop('method', S.string().default('GET'))
  .prop('url', S.string().required())
  .prop('frequency', S.integer().minimum(10).required())
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
  .prop('variables', MonitorTupleFluentSchema)
  .prop('env', S.array().items(S.string()))
  .prop('assertions', MonitorAssertionsFluentSchema)
  .prop('notifications', MonitorNotificationSchema)

export const MonitorsQueryResponseSchema = S.object()
  .prop('items', S.array().items(MonitorFluentSchema))
  .prop('total', S.number())

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
  variables?: MonitorTuples
  env?: string[]
  notifications?: MonitorNotifications
  day50?: number
  dayAvg?: number
  uptime?: number
}

export type Monitor = MonitorTable

export type UserAccount = {
  id?: string
  createdAt?: string | Date
  userId?: string
  email: string
  accountId: string
  role: string
  isPrimary: boolean
  status?: string
  isVerified: boolean
  token: string | null
  tokenExpiryAt?: string | Date | null
}

export const UserAccountSchema = S.object()
  .prop('id', S.string())
  .prop('createdAt', S.string())
  .prop('userId', S.string())
  .prop('email', S.string())
  .prop('accountId', S.string())
  .prop('role', S.string())
  .prop('isPrimary', S.boolean())
  .prop('status', S.string())
  .prop('isVerified', S.boolean())
  .prop('token', S.string())
  .prop('tokenExpiryAt', S.string())

export type Account = {
  id?: string
  createdAt?: string | Date
  owner: string
  name: string
  stripeCustomerId?: string
}

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
  email: string // email string
}

export const EmailNotificationSchema = S.object()
  .prop('email', S.string().required())
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
  name: string // notification name
  isDefaultEnabled: boolean
  applyOnExistingMonitors: boolean
  channel: SlackNotificationChannel | EmailNotificationChannel | MSTeamsNotificationChannel
}

export const NotificationSchema = S.object()
  .prop('name', S.string().required())
  .prop('id', S.string())
  .prop('isDefaultEnabled', S.boolean().default(false))
  .prop('applyOnExistingMonitors', S.boolean().default(false))
  .prop(
    'channel',
    S.anyOf([SlackNotificationSchema, EmailNotificationSchema, MSTeamsNotificationSchema])
  )

export type AlertSettings = {
  failCount: number // send notification after the number of failures
  failTimeMinutes: number // send notification after the number of minutes
}

export const AlertSettingsSchema = S.object()
  .prop('failCount', S.integer().minimum(0).maximum(10))
  .prop('failTimeMinutes', S.integer().enum(Object.values([0, 5, 10, 15, 20, 30, 60])))

export type MonitorLocation = {
  region: string
  name: string
  set: boolean
}

export const MonitorLocationSchema = S.object()
  .prop('region', S.string())
  .prop('name', S.string())
  .prop('set', S.boolean())

export type UIState = {
  editor: {
    monitorLocations: MonitorLocation[]
    frequencyScale: number
  }
  results: {
    tabIndex: number
    filter: {
      timePeriod: { label: string; value: string }
      status: string
      locations: string[]
    }
  }
  monitors: {
    isGridView: boolean
    currentPage: number
    pageSize: number
  }
}

export const UIStateSchema = S.object()
  .prop(
    'editor',
    S.object()
      .prop('monitorLocations', S.array().items(MonitorLocationSchema))
      .prop('frequencyScale', S.number())
  )
  .prop(
    'results',
    S.object()
      .prop('tabIndex', S.number())
      .prop(
        'filter',
        S.object()
          .prop('timePeriod', S.object().prop('label', S.string()).prop('value', S.string()))
          .prop('status', S.string())
          .prop('locations', S.array().items(S.string()))
      )
  )
  .prop(
    'monitors',
    S.object()
      .prop('isGridView', S.boolean())
      .prop('currentPage', S.number())
      .prop('pageSize', S.number())
  )

export type Settings = {
  id?: string
  alert: AlertSettings
  uiState?: UIState
  accountId: string
}

export const SettingsSchema = S.object()
  .prop('id', S.string())
  .prop('uiState', UIStateSchema)
  .prop('accountId', S.string())
  .prop('alert', AlertSettingsSchema)

export type ActivityLog = {
  id?: string
  createdAt?: String | Date
  accountId?: string
  monitorId?: string
  resultId?: string
  type: string
  data: Record<string, string> | string
}

export const ActivityLogSchema = S.object()
  .prop('createdAt', S.string())
  .prop('accountId', S.string())
  .prop('monitorId', S.string())
  .prop('resultId', S.string())
  .prop('type', S.string())
  .prop('data', S.object().prop('msg', S.string()))

export const ActivityLogsResponseSchema = S.object()
  .prop('items', S.array().items(ActivityLogSchema))
  .prop('total', S.number())

export type NotificationEmailStatus = 'verified' | 'unverified' | 'expired'

export const EmailVerificationSchema = S.object()
  .prop('email', S.string())
  .prop('token', S.string())
export type EmailVerification = {
  email: string
  token?: string
}

export type StatusPage = {
  id?: string
  createdAt?: string | Date
  accountId: string
  name: string
  logoUrl: string
  monitors: string[]
  siteUrl?: string
}

export type StatusPageDetails = {
  id: string
  createdAt?: string | Date
  accountId: string
  name: string
  logoUrl: string
  monitors: Monitor[]
  siteUrl: string
}

export const StatusPageSchema = S.object()
  .prop('id', S.string())
  .prop('createdAt', S.string())
  .prop('accountId', S.string())
  .prop('name', S.string())
  .prop('logoUrl', S.string())
  .prop('monitors', S.array().items(S.string()))
  .prop('siteUrl', S.string())

export const StatusPageDetailsSchema = S.object()
  .prop('id', S.string())
  .prop('createdAt', S.string())
  .prop('accountId', S.string())
  .prop('name', S.string())
  .prop('logoUrl', S.string())
  .prop('monitors', S.array().items(MonitorFluentSchema))
  .prop('siteUrl', S.string())

export interface PaginateQueryString {
  limit: number
  offset: number
}

export type BillingInfo = {
  id?: string
  createdAt?: string | Date
  accountId: string
  billingPlanType: string
  monitorRunsLimit: number | null
  defaultPaymentMethod?: string
}

export const BillingInfoSchema = S.object()
  .prop('id', S.string())
  .prop('createdAt', S.string())
  .prop('accountId', S.string())
  .prop('billingPlanType', S.string())
  .prop('monitorRunsLimit', S.number())
  .prop('defaultPaymentMethod', S.string())
export interface MonitorRunResult {
  runId: string
  mon: Monitor
  resultId?: string
  err?: {
    msg: string
    codeStatus?: string
  }
}

export const MonitorRunResultSchema = S.object()
  .prop('mon', MonitorFluentSchema)
  .required()
  .prop('runId', S.string())
  .required()
  .prop('resultId', S.string())
  .prop('err', S.object().prop('msg', S.string()).prop('codeStatus', S.string()))

export type ApiKey = {
  id?: string
  name: string
  hash: string
  tag: string
  token?: string
  userId: string
  createdAt?: string
}

export const ApiKeySchema = S.object()
  .prop('id', S.string())
  .prop('name', S.string())
  .prop('hash', S.string())
  .prop('tag', S.string())
  .prop('userId', S.string())
  .prop('token', S.string())
  .prop('createdAt', S.string())
