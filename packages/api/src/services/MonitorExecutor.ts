import { DetailedPeerCertificate, PeerCertificate } from 'tls'

import { Monitor, MonitorTuples, MonitorResult } from '@httpmon/db'
import https from 'https'
import clone from 'lodash.clonedeep'
import Handlebars from 'handlebars'
import { randomInt } from 'crypto'
import got, { Method, RequestError, Response } from 'got'
import { Timings } from '@szmarczak/http-timer/dist/source'
import { getCloudRegion, logger } from '../Context'
import { processAssertions } from './Assertions'
import { MonitorResultEvent, publishEvent } from './EventService'
import { saveMonitorResult } from './DBService'

const customGot = got.extend({
  headers: {
    'user-agent': 'API Checker/1.0',
  },
  timeout: { request: 10000 },
  allowGetBody: true,
})

Handlebars.registerHelper('RandomInt', function () {
  return randomInt(10000)
})

function convertTimings(timings?: Timings) {
  return {
    waitTime: timings?.phases?.wait ?? 0,
    dnsTime: timings?.phases?.dns ?? 0,
    tcpTime: timings?.phases?.tcp ?? 0,
    tlsTime: timings?.phases?.tls ?? 0,
    uploadTime: timings?.phases?.request ?? 0,
    ttfb: timings?.phases?.firstByte ?? 0,
    downloadTime: timings?.phases?.download ?? 0,
    totalTime: timings?.phases?.total ?? 0,
  }
}

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
    location: getCloudRegion(),
  }
}
export function makeMonitorResultError(monitor: Monitor, err: string) {
  let result: MonitorResult = {
    ...responseToMonitorResult(),
    url: monitor.url,
    monitorId: monitor.id ?? '',
    accountId: monitor.accountId,
    err: err,
  }

  return result
}

function responseToMonitorResult(resp?: Response<string>) {
  return {
    ...emptyResponse(),
    ...convertTimings(resp?.timings),
    code: resp?.statusCode ?? 0,
    codeStatus: resp?.statusMessage ?? '',
    ip: resp?.ip ?? '',
    body: resp?.body ?? '',
    bodySize: resp?.body.length ?? 0,
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
export async function execMonitor(monitor: Monitor) {
  let certCommonName = ''
  let certExpiryDays = 0

  let mon = { ...monitor }

  try {
    var startTime = performance.now()
    mon = processTemplates(monitor)
    var endTime = performance.now()
    logger.info(`Call ${monitor.url} took ${endTime - startTime} milliseconds`)

    const resp = await customGot(mon.url, {
      method: mon.method as Method,
      body: Boolean(mon.body) && Boolean(mon.bodyType) ? mon.body : undefined,
      agent: {
        https: new https.Agent({ keepAlive: false }),
      },
      headers: {
        'Content-Type': mon.bodyType,
        ...headersToMap(mon.headers),
        ...prepareBearerAuth(mon),
      },

      ...prepareBasicAuth(mon),

      // responseType: 'text',
      searchParams: mon.queryParams ? headersToMap(mon.queryParams as MonitorTuples) : undefined,
      https: {
        checkServerIdentity: (_hostname: string, certificate: DetailedPeerCertificate) => {
          if (certificate && certificate.subject) {
            certCommonName = certificate.subject.CN
            const expiry = new Date(certificate.valid_to).valueOf()
            const now = new Date().valueOf()
            certExpiryDays = Math.floor((expiry - now) / 1000 / 60 / 60 / 24)
          }
        },
      },
    })

    const result: MonitorResult = {
      url: resp.redirectUrls.length > 0 ? resp.redirectUrls[resp.redirectUrls.length - 1] : mon.url,
      ...responseToMonitorResult(resp),
      monitorId: mon.id ?? 'ondemand',
      accountId: mon.accountId,
      certCommonName,
      certExpiryDays,
      err: '',
    }

    return result
  } catch (e: any) {
    logger.error(e, 'got failed')
    if (e instanceof RequestError) {
      return {
        monitorId: mon.id ?? 'ondemand',
        accountId: mon.accountId,
        url: mon.url,
        ...emptyResponse(),
        ...convertTimings(e.timings),
        codeStatus: e.code,
        err: e.code,
      } as MonitorResult
    } else {
      return {
        ...responseToMonitorResult(),
        err: e?.message ?? e.toString(),
        monitorId: mon.id ?? 'ondemand',
        accountId: mon.accountId,
        url: mon.url,
      } as MonitorResult
    }
  }
}

export async function execMonitorAndProcessResponse(monitor: Monitor) {
  const result = await execMonitor(monitor)
  if (result.err == '') {
    const asserionResults = processAssertions(monitor, result)
    result.assertResults = asserionResults
    result.err = asserionResults.some((a) => a.fail) ? 'assertions failed' : ''
  }

  logger.info(
    `exec-monitor-result: code: ${result.code} err: ${result.err} totalTime: ${result.totalTime}`
  )

  //createdAt caused type issue for db
  const monitorResult = await saveMonitorResult({
    ...result,
    accountId: monitor.accountId,
  })

  if (!monitor.notifications || !monitor.id || !monitorResult?.id) return

  let resultEvent: MonitorResultEvent = {
    monitorId: monitor.id,
    resultId: monitorResult.id,
    accountId: monitor.accountId,
    notifications: monitor.notifications,
    err: result.err,
  }

  publishEvent({
    type: 'monitor-result',
    data: resultEvent,
  })
}
