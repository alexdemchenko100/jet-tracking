import { Monitor, MonitorRunResult } from '@httpmon/db'
import { publishMonitorRunMessage, publishScriptRunMessage } from './PubSubService'

import { v4 as uuidv4 } from 'uuid'

export async function handlePreRequest(mon: Monitor) {
  //Todo: Compute final Env

  const monrun: MonitorRunResult = { mon, runId: uuidv4() }

  if (mon.preScript && mon.preScript.length > 0) {
    publishScriptRunMessage(monrun)
    return
  }

  publishMonitorRunMessage(monrun)
}
