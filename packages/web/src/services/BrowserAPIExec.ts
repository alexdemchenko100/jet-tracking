import { Monitor, MonitorTuples, MonitorResult } from '@httpmon/db'
import clone from 'lodash.clonedeep'
import Handlebars from 'handlebars'
// import { randomInt } from 'crypto'
import ky, { HTTPError } from 'ky'

const customKy = ky.extend({
  headers: {
    'User-Agent': 'API Checker/1.0',
    'Accept-Encoding': 'br, gzip, deflate',
    Accept: '*/*',
  },
  keepalive: true,
  timeout: 10000,
  mode: 'cors',
  credentials: 'same-origin',
})

// Handlebars.registerHelper('RandomInt', function () {
//   return randomInt(10000)
// })

function emptyResponse() {
  return {
    ip: '',
    protocol: '',
    body: '',
    bodySize: 0,
    headers: [],
    certCommonName: '',
    certExpiryDays: 0,
    codeStatus: '',
    code: 0,
    waitTime: 0,
    dnsTime: 0,
    tcpTime: 0,
    tlsTime: 0,
    uploadTime: 0,
    ttfb: 0,
    downloadTime: 0,
    totalTime: 0,
    location: 'localhost',
  }
}
async function responseToMonitorResult(resp?: Response) {
  const body = (await resp?.text()) ?? ''
  const bodySize = body.length

  console.log('hdrs', JSON.stringify(resp?.headers))

  return {
    ...emptyResponse(),
    code: resp?.status ?? 0,
    codeStatus: resp?.statusText ?? '',
    ip: '',
    body,
    bodySize,
    headers: resp?.headers ? headersToTuples(resp?.headers) : [],
  }
}

function headersToMap(headers: MonitorTuples = []) {
  let hmap: { [key: string]: string } = {}
  headers.forEach((header) => {
    hmap[header[0]] = header[1]
  })
  return hmap
}

/**
 *
 * Axios formats duplicate response headers as an array
 * ex: { "set-cookie": [ "cookie-1", "cookie-2"]}
 * This function deconstructs such array to confirm to
 * the MonitorTuples format
 * ex: [ ["set-cookie", "cookie-1"], ["set-cookie", "cookie-2"]]
 */
function headersToTuples(headers: object): MonitorTuples {
  let tuples: MonitorTuples = []
  Object.entries(headers ?? {}).map(([key, value]) => {
    if (Array.isArray(value)) {
      value.map((item) => {
        tuples.push([key, item])
      })
    } else {
      tuples.push([key, value])
    }
  })
  return tuples
}

function processTemplates(mon: Monitor) {
  //url bar
  //header value fields
  //query value fields
  //body
  let env: { [k: string]: string } = {}
  if (mon.env && Array.isArray(mon.env)) {
    mon.env.map(([name, value], _index) => {
      env[name] = value
    })
  }

  let m = clone(mon)

  m.url = Handlebars.compile(mon.url)(env)

  if (mon.headers && typeof mon.headers != 'string') {
    let hdrs = m.headers as MonitorTuples
    m.headers = hdrs.map(([name, value]) => [name, Handlebars.compile(value)(env)])
  }

  if (mon.queryParams && typeof mon.queryParams != 'string') {
    let qp = m.queryParams as MonitorTuples
    m.queryParams = qp.map(([name, value]) => [name, Handlebars.compile(value)(env)])
  }

  if (m.body) {
    m.body = Handlebars.compile(mon.body)(env)
  }
  return m
}

function prepareBearerAuth(monitor: Monitor) {
  if (monitor.auth?.type === 'bearer' && monitor.auth?.bearer?.token) {
    return { Authorization: `Bearer ${monitor.auth.bearer.token}` }
  }
  return {}
}

function prepareBasicAuth(monitor: Monitor) {
  if (monitor.auth?.type == 'basic') {
    if (monitor.auth?.basic?.username)
      return {
        username: monitor.auth.basic.username,
        password: monitor.auth?.basic?.password,
      }
  }

  return {}
}

/**
 *
 * @param monitor
 * Executes given monitor after doing handlebar template
 * substitutions based on the given env.
 * @returns
 */
export async function browserExecMonitor(monitor: Monitor) {
  const mon = processTemplates(monitor)

  try {
    const resp = await customKy(mon.url, {
      method: mon.method,
      body: Boolean(mon.body) && Boolean(mon.bodyType) ? mon.body : undefined,
      headers: {
        'Content-Type': mon.bodyType,
        ...headersToMap(mon.headers),
        ...prepareBearerAuth(mon),
      },

      ...prepareBasicAuth(mon),

      // responseType: 'text',
      searchParams: mon.queryParams ? headersToMap(mon.queryParams as MonitorTuples) : undefined,
    })

    const result: MonitorResult = {
      url: resp.url,
      ...(await responseToMonitorResult(resp)),
      monitorId: mon.id ?? 'ondemand',
      err: '',
    }

    return result
  } catch (e: any) {
    if (e instanceof HTTPError) {
      return {
        monitorId: mon.id ?? 'ondemand',
        url: mon.url,
        ...emptyResponse(),
        codeStatus: e.response?.statusText ?? '',
        err: e.response?.status.toString() ?? '',
      } as MonitorResult
    } else {
      return {
        ...(await responseToMonitorResult()),
        err: e?.message ?? e.toString(),
        monitorId: mon.id ?? 'ondemand',
      } as MonitorResult
    }
  }
}
