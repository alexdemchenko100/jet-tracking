import { EnvService } from './EnvService'
import { DetailedPeerCertificate } from 'tls'

import { Monitor, MonitorTuples, MonitorResult, MonitorRunResult, db } from '@httpmon/db'
import https from 'https'
import clone from 'lodash.clonedeep'
import Handlebars from 'handlebars'
import { randomInt } from 'crypto'
import got, { Method, RequestError, Response } from 'got'
import { logger } from '../Context'
import { processAssertions } from './Assertions'
import { publishOndemandResponseMessage, publishPostRequestMessage } from './PubSubService'
import { saveMonitorResult } from './DBService'
import { requestErrorToMonitorResult, responseToMonitorResult } from 'src/utils/common'

const customGot = got.extend({
  headers: {
    'user-agent': 'API Checker/1.0',
  },
  timeout: { request: 15000 },
  allowGetBody: true,
  throwHttpErrors: false,
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

async function getTemplateVariableMap(mon: Monitor) {
  const envs = mon.accountId
    ? await db.selectFrom('MonEnv').selectAll().where('accountId', '=', mon.accountId).execute()
    : []

  const monEnvIds = mon.environments ?? []
  const globalEnv = envs.find((e) => e.name == '__global__')?.env ?? []
  const selectedEnvs = monEnvIds.flatMap((id) => [envs.find((e) => e.id == id)?.env || []])
  const allEnvs = [globalEnv, ...selectedEnvs, mon.variables ?? []].flat()

  //now put all tuples into a map -- only latest conflicting entry remains!
  const allEnvMap = Object.fromEntries(allEnvs)

  // logger.error(allEnvs, 'allevs')
  // logger.error(allEnvMap, 'allevs map')
  return allEnvMap
}

async function processTemplates(mon: Monitor) {
  //url bar
  //header value fields
  //query value fields
  //body

  //first see if we are candidate for templating
  const m = clone(mon)
  let hdrs = (m.headers as MonitorTuples) || []
  let queryParams = (m.queryParams as MonitorTuples) || []

  const hasTemplates =
    m.url.includes('{{') ||
    m.body?.includes('{{') ||
    hdrs.find(([key, val]) => key.includes('{{') || val.includes('{{')) ||
    queryParams.find(([key, val]) => key.includes('{{') || val.includes('{{'))

  // nothing to do, move on
  if (!hasTemplates) return mon

  let finalEnvMap = await getTemplateVariableMap(mon)

  m.url = Handlebars.compile(mon.url)(finalEnvMap)

  if (mon.headers && typeof mon.headers != 'string') {
    let hdrs = m.headers as MonitorTuples
    m.headers = hdrs.map(([name, value]) => [name, Handlebars.compile(value)(finalEnvMap)])
  }

  if (mon.queryParams && typeof mon.queryParams != 'string') {
    let qp = m.queryParams as MonitorTuples
    m.queryParams = qp.map(([name, value]) => [name, Handlebars.compile(value)(finalEnvMap)])
  }

  if (m.body) {
    m.body = Handlebars.compile(mon.body)(finalEnvMap)
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

function isResponseOkay(response: Response<any>) {
  const statusCode = response.statusCode
  const limitStatusCode = response.request.options.followRedirect ? 299 : 399

  return (statusCode >= 200 && statusCode <= limitStatusCode) || statusCode === 304
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
    mon = await processTemplates(monitor)

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
      monitorId: mon.id ?? '',
      accountId: mon.accountId,
      certCommonName,
      certExpiryDays,
      err: isResponseOkay(resp) ? '' : 'ERR_HTTP_ERROR_CODE',
    }

    return result
  } catch (e: any) {
    if (e instanceof RequestError) {
      return {
        ...requestErrorToMonitorResult(e),
        monitorId: mon.id ?? '',
        accountId: mon.accountId,
        url: mon.url,
        err: e.code,
      } as MonitorResult
    } else {
      return {
        ...responseToMonitorResult(),
        err: e?.message ?? e.toString(),
        monitorId: mon.id ?? '',
        accountId: mon.accountId,
        url: mon.url,
      } as MonitorResult
    }
  }
}

export async function runMonitor(monrun: MonitorRunResult) {
  const monitor = monrun.mon
  const result = await execMonitor(monrun.mon)

  const bCodeAsserts = monitor.assertions?.find((a) => a.type == 'code')

  //process assertions on success or on HttpError handling assertions
  const bCanProcessAssertions = !result.err || (bCodeAsserts && result.err == 'ERR_HTTP_ERROR_CODE')

  if (bCanProcessAssertions) {
    const asserionResults = processAssertions(monitor, result)
    result.assertResults = asserionResults
    result.err = asserionResults.some((a) => a.fail) ? 'ERR_ASSERTIONS' : ''
  }

  logger.info(
    { code: result.code, err: result.err, totalTime: result.totalTime },
    'exec-monitor-result'
  )

  if (monitor.status == 'ondemand') {
    await publishOndemandResponseMessage({...monrun, result})
    return
  }

  //createdAt caused type issue for db
  const monitorResult = await saveMonitorResult(
    {
      ...result,
      accountId: monrun.mon.accountId,
    },
    monitor
  )

  let runResult: MonitorRunResult = {
    runId: monrun.runId,
    mon: monitor,
    resultId: monitorResult?.id,
    err: {
      msg: result.err,
    },
  }

  await publishPostRequestMessage(runResult)
}
