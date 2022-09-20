import { DetailedPeerCertificate } from 'tls'

import { Monitor, MonitorTuples, MonitorResult, MonitorRunResult } from '@httpmon/db'
import https from 'https'
import clone from 'lodash.clonedeep'
import Handlebars from 'handlebars'
import { randomInt } from 'crypto'
import got, { Method, RequestError } from 'got'
import { logger } from '../Context'
import { processAssertions } from './Assertions'
import { publishPostRequestMessage } from './PubSubService'
import { saveMonitorResult } from './DBService'
import { requestErrorToMonitorResult, responseToMonitorResult } from 'src/utils/common'

const customGot = got.extend({
  headers: {
    'user-agent': 'API Checker/1.0',
  },
  timeout: { request: 15000 },
  allowGetBody: true,
})

Handlebars.registerHelper('RandomInt', function () {
  return randomInt(10000)
})

function headersToMap(headers: MonitorTuples = []) {
  let hmap: { [key: string]: string } = {}
  headers.forEach((header) => {
    hmap[header[0]] = header[1]
  })
  return hmap
}

function processTemplates(mon: Monitor) {
  //url bar
  //header value fields
  //query value fields
  //body
  let env: { [k: string]: string } = {}
  if (mon.variables && Array.isArray(mon.variables)) {
    mon.variables.map(([name, value], _index) => {
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
    // var startTime = performance.now()
    // mon = processTemplates(monitor)
    // var endTime = performance.now()
    // logger.info(`Call ${monitor.url} took ${endTime - startTime} milliseconds`)

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
    if (e instanceof RequestError) {
      return {
        ...requestErrorToMonitorResult(e),
        monitorId: mon.id ?? 'ondemand',
        accountId: mon.accountId,
        url: mon.url,
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

export async function runMonitor(monrun: MonitorRunResult) {
  const monitor = monrun.mon
  const result = await execMonitor(monrun.mon)
  if (result.err == '') {
    const asserionResults = processAssertions(monitor, result)
    result.assertResults = asserionResults
    result.err = asserionResults.some((a) => a.fail) ? 'assertions failed' : ''
  }

  logger.info(
    { code: result.code, err: result.err, totalTime: result.totalTime },
    'exec-monitor-result'
  )

  //createdAt caused type issue for db
  const monitorResult = await saveMonitorResult({
    ...result,
    accountId: monrun.mon.accountId,
  })

  if (!monitor.notifications || !monitor.id || !monitorResult?.id) return

  let runResult: MonitorRunResult = {
    runId: monrun.runId,
    mon: monitor,
    resultId: monitorResult.id,
    err: {
      msg: result.err,
    },
  }

  publishPostRequestMessage(runResult)
}
