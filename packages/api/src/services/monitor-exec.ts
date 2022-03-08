import { DetailedPeerCertificate, PeerCertificate } from 'tls'

import { Monitor, MonitorTuples, MonitorResult } from '@httpmon/db'
import timer, { Timings } from '@szmarczak/http-timer'
import https from 'https'
import clone from 'lodash.clonedeep'
import Handlebars from 'handlebars'
import { randomInt } from 'crypto'
import got, { Method, Response } from 'got'
import pino from 'pino'
const logger = pino()

Handlebars.registerHelper('RandomInt', function () {
  return randomInt(10000)
})

function responseToMonitorResult(resp?: Response<string>) {
  let body: string = ''
  let bodyJson: string | undefined
  let bodySize = 0
  if (resp?.body) {
    if (typeof resp.body == 'object') {
      bodyJson = JSON.stringify(resp.body, null, 2)
      bodySize = bodyJson.length
    } else if (typeof resp.body == 'string') {
      body = resp.body
      bodySize = body.length
    }
  }
  let timings = resp?.timings

  return {
    code: resp?.statusCode ?? 0,
    codeStatus: resp?.statusMessage ?? '',
    dnsLookupTime: timings?.phases?.dns ?? 0,
    tcpConnectTime: timings?.phases?.tcp ?? 0,
    tlsHandshakeTime: timings?.phases?.tls ?? 0,
    timeToFirstByte: timings?.phases?.firstByte ?? 0,
    totalTime: timings?.phases?.total ?? 0,
    protocol: '',
    body,
    bodyJson,
    bodySize,
    headers: resp?.headers ? headersToTuples(resp?.headers) : [],
    certCommonName: '',
    certExpiryDays: 0,
  }
}

function headersToMap(headers: MonitorTuples) {
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
    m.headers = hdrs.map(([name, value]) => [
      name,
      Handlebars.compile(value)(env),
    ])
  }

  if (mon.queryParams && typeof mon.queryParams != 'string') {
    let qp = m.queryParams as MonitorTuples
    m.queryParams = qp.map(([name, value]) => [
      name,
      Handlebars.compile(value)(env),
    ])
  }

  if (m.body) {
    m.body = Handlebars.compile(mon.body)(env)
  }
  return m
}

export async function execMonitor(monitor: Monitor) {
  let certCommonName = ''
  let certExpiryDays = 0

  var startTime = performance.now()
  const mon = processTemplates(monitor)
  var endTime = performance.now()
  logger.info(`Call to doSomething took ${endTime - startTime} milliseconds`)

  try {
    const resp = await got(mon.url, {
      method: mon.method as Method,
      body: Boolean(mon.body) ? mon.body : undefined,
      agent: {
        https: new https.Agent({ keepAlive: false }),
      },
      headers: mon.headers
        ? headersToMap(mon.headers as MonitorTuples)
        : undefined,
      responseType: 'text',
      searchParams: mon.queryParams
        ? headersToMap(mon.queryParams as MonitorTuples)
        : undefined,
      https: {
        checkServerIdentity: (
          _hostname: string,
          certificate: DetailedPeerCertificate
        ) => {
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
      url:
        resp.redirectUrls.length > 0
          ? resp.redirectUrls[resp.redirectUrls.length - 1]
          : mon.url,
      ...responseToMonitorResult(resp),
      monitorId: mon.id ?? 'ondemand',
      certCommonName,
      certExpiryDays,
      err: '',
    }

    return result
  } catch (e) {
    logger.error(e, 'got failed')
    if (e.response) {
      const resp = e.response
      return {
        ...responseToMonitorResult(resp),
        monitorId: mon.id ?? 'ondemand',
        certCommonName,
        certExpiryDays,
        err: '',
      } as MonitorResult
    } else {
      return {
        ...responseToMonitorResult(),
        err: e?.message ?? e.toString(),
        monitorId: mon.id ?? 'ondemand',
      } as MonitorResult
    }
  }
}
