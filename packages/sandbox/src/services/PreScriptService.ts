import {
  Monitor,
  MonitorFluentSchema,
  MonitorRequest,
  MonitorTuples,
  MonitorRunResult,
} from '@httpmon/db'
import { logger, state } from './Context'
import S from 'fluent-json-schema'
import { PubSub } from '@google-cloud/pubsub'
import { handlePreScriptExecution } from './sandboxProcessRunner'

let pubsub: PubSub | null = null

export async function publishMessage(topic: string, res: MonitorRunResult) {
  if (process.env.NODE_ENV != 'production') return res

  const projectId = state.projectId
  if (!pubsub) {
    pubsub = new PubSub({ projectId })
  }

  if (!pubsub) throw new Error('Pubsub is not initialized')

  //publish  to cloud pubsub
  try {
    await pubsub.topic(topic).publishMessage({ attributes: { type: topic }, json: res })
    logger.info(res, `Published to ${topic}`)
  } catch (error) {
    logger.error(`Received error while publishing to ${topic} - ${error.message}`)
  }
  return res
}

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

export async function execPreScript(monrun: MonitorRunResult) {
  const mon = monrun.mon
  const request = monitorToRequest(mon)
  const env = headersToMap(mon.variables)

  const topic = `${state.projectId}-end-api-prescript`

  const bPreScript = mon.preScript && mon.preScript.length > 0

  if (!bPreScript) {
    monrun.err = { msg: 'preScript called but no script exists!' }
    return publishMessage(topic, monrun)
  }

  logger.info(request, 'execPreScript-Start')

  try {
    const resp = await handlePreScriptExecution(request, env, mon.preScript)

    logger.info(resp, 'execPreScript-Resp')

    let newmon = {
      ...mon,
      headers: headersToTuples(resp.ctx.request.headers),
      variables: headersToTuples(resp.ctx.env),
    }
    return publishMessage(topic, { mon: newmon, runId: monrun.runId })
  } catch (e) {
    //handle script error
    console.log('pre error: ', JSON.stringify(e))
    monrun.err = { msg: `preScript: ${JSON.stringify(e)}` }

    return publishMessage(topic, monrun)
  }
}
