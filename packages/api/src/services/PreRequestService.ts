import { MonitorRunResult } from '@httpmon/db'
import { publishMonitorRunMessage, publishScriptRunMessage } from './PubSubService'

export async function handlePreRequest(monrun: MonitorRunResult) {
  //Todo: Compute final Env

  const mon = monrun.mon

  if (mon.preScript && mon.preScript.length > 0) {
    publishScriptRunMessage(monrun)
    return
  }

  publishMonitorRunMessage(monrun)
}
