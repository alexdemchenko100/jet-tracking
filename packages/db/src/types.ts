import S from 'fluent-json-schema'
export type MonitorTuples = [string, string][]

export const MonitorTupleFluentSchema = S.array().items(
  S.array().items(S.string()).maxItems(2).minItems(2)
)

export const MonitorLocations = [
  { region: 'us-east1', name: 'N. Carolina', set: true },
  { region: 'eu-west3', name: 'Frankfurt', set: false },
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

export interface MonitorResultTable {
  id?: string
  createdAt?: String | Date
  monitorId: string
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
  .prop('headers', MonitorTupleFluentSchema)
  .prop('queryParams', MonitorTupleFluentSchema)
  .prop('locations', S.array().items(S.string().enum(CloudRegions)))
  .prop('cookies', S.anyOf([S.string(), S.null()]))
  .prop('followRedirects', S.integer())
  .prop('timeout', S.integer())
  .prop('notifyEmail', S.anyOf([S.string(), S.null()]))
  .prop('env', MonitorTupleFluentSchema)
  .prop('assertions', MonitorAssertionsFluentSchema)

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

export type MonitorAssertionResult = MonitorAssertion & {
  fail?: string
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
  auth?: MonitorAuth
  headers?: MonitorTuples
  locations?: string[]
  queryParams?: MonitorTuples
  cookies?: string
  followRedirects?: number
  timeout?: number
  assertions?: MonitorAssertion[]
  notifyEmail?: string
  env?: MonitorTuples
}

export type Monitor = MonitorTable
