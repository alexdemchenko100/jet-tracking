import { emitter } from './emitter'
import { Monitor, MonitorRequest, MonitorTuples } from '@httpmon/db'

import { handlePreScriptExecution } from '@httpmon/sandbox'
import { execMonitorAndProcessResponse, makeMonitorResultError } from './MonitorExecutor'
import { logger } from '../Context'
import { saveMonitorResult } from './DBService'

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

export async function execPreScript(mon: Monitor) {
  const request = monitorToRequest(mon)
  const env = headersToMap(mon.env)

  try {
    const resp = await handlePreScriptExecution(request, env, mon.preScript)

    logger.info(JSON.stringify(resp, null, 2), 'execPreScript')

    let newmon = {
      ...mon,
      headers: headersToTuples(resp.ctx.request.headers),
      env: headersToTuples(resp.ctx.env),
    }

    emitter.emit('execAfterPreScript', newmon)
  } catch (e) {
    //handle script error
    console.log('pre error: ', JSON.stringify(e))

    //createdAt caused type issue for db
    const result = makeMonitorResultError(mon, e.err ?? e.toString())
    result.codeStatus = result.err
    const monitorResult = await saveMonitorResult(result)
  }
}

export async function setupEmitterHandlers() {
  logger.info('* setting emitter *')
  emitter.on('execPreScript', async (mon: Monitor) => {
    logger.info('execPreScript')
    await execPreScript(mon)
  })

  emitter.on('execAfterPreScript', async (mon: Monitor) => {
    logger.info('execAfterPreScript')
    await execMonitorAndProcessResponse(mon)
  })
}
