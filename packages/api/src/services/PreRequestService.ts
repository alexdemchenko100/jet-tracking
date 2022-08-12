import { Monitor, MonitorRunResult } from '@httpmon/db'
import { state } from '../Context'
import { publishMessage, publishMonitorRunMessage } from './EventService'

import { v4 as uuidv4 } from 'uuid'

// export async function execPreRequestScript(mon: Monitor) {
//   const request = monitorToRequest(mon)
//   const env = headersToMap(mon.variables)

//   //logger.info(request, 'execPreScript-Start')

//   try {
//     const resp = await handlePreScriptExecution(request, env, mon.preScript)

//     logger.info(resp, 'execPreScript-Resp')

//     let newmon = {
//       ...mon,
//       headers: headersToTuples(resp.ctx.request.headers),
//       variables: headersToTuples(resp.ctx.env),
//     }
//     return newmon
//   } catch (e) {
//     //handle script error
//     console.log('pre error: ', JSON.stringify(e))

//     //createdAt caused type issue for db
//     const result = makeMonitorResultError(mon, e.err ?? e.toString())
//     result.codeStatus = result.err

//     const monitorResult = await saveMonitorResult(result)

//     if (!mon.notifications || !mon.id || !monitorResult?.id) return

//     publishPostRequestEvent({
//       type: 'monitor-postrequest',
//       monitorId: mon.id,
//       monitorName: mon.name,
//       resultId: monitorResult.id,
//       accountId: mon.accountId,
//       notifications: mon.notifications,
//       err: result.err,
//     })
//   }
//   return null
// }

export async function handlePreRequest(mon: Monitor) {
  //Todo: Compute final Env

  const monrun: MonitorRunResult = { mon, runId: uuidv4() }

  if (mon.preScript && mon.preScript.length > 0) {
    publishMessage(`${state.projectId}-api-script-run`, monrun)
    return
  }

  publishMonitorRunMessage(monrun)
}
