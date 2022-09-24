import { logger } from './../Context'
import { MonitorRunResult } from '@httpmon/db'
import { makeMonitorResultError } from 'src/utils/common'
import { saveMonitorResult } from './DBService'
import { publishMonitorRunMessage, publishPostRequestMessage } from './PubSubService'

export async function handleScriptResult(monrun: MonitorRunResult) {
  if (monrun.err) {
    const result = makeMonitorResultError(monrun.mon, monrun.err?.msg)
    //save error and quit
    const saved = await saveMonitorResult(result, monrun.mon)

    publishPostRequestMessage({ ...monrun, resultId: saved?.id })
    return
  }

  publishMonitorRunMessage(monrun)
}
