import { Monitor, MonitorRequest, MonitorTuples } from '@httpmon/db'

import { handlePreScriptExecution } from '@httpmon/sandbox'
import { makeMonitorResultError } from './MonitorRunner'
import { logger } from '../Context'
import { saveMonitorResult } from './DBService'
import { publishPostRequestEvent } from './EventService'

function headersToMap(headers: MonitorTuples = []) {
  let hmap: { [key: string]: string } = {}
  headers.forEach((header) => {
    hmap[header[0]] = header[1]
  })
  return hmap
}

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

function monitorToRequest(mon: Monitor) {
  let req: MonitorRequest = {
    method: mon.method,
    url: mon.url,
    headers: headersToMap(mon.headers),
    queryParams: headersToMap(mon.queryParams),
  }
  return req
}

export async function execPreRequestScript(mon: Monitor) {
  const request = monitorToRequest(mon)
  const env = headersToMap(mon.env)

  //logger.info(request, 'execPreScript-Start')

  try {
    const resp = await handlePreScriptExecution(request, env, mon.preScript)

    logger.info(resp, 'execPreScript-Resp')

    let newmon = {
      ...mon,
      headers: headersToTuples(resp.ctx.request.headers),
      env: headersToTuples(resp.ctx.env),
    }
    return newmon
  } catch (e) {
    //handle script error
    console.log('pre error: ', JSON.stringify(e))

    //createdAt caused type issue for db
    const result = makeMonitorResultError(mon, e.err ?? e.toString())
    result.codeStatus = result.err

    const monitorResult = await saveMonitorResult(result)

    if (!mon.notifications || !mon.id || !monitorResult?.id) return

    publishPostRequestEvent({
      type: 'monitor-postrequest',
      monitorId: mon.id,
      resultId: monitorResult.id,
      accountId: mon.accountId,
      notifications: mon.notifications,
      err: result.err,
    })
  }
  return null
}

export async function handlePreRequest(mon: Monitor) {
  //Todo: Compute final Env

  if (mon.preScript && mon.preScript.length > 0) {
    return execPreRequestScript(mon)
  }

  return mon
}
