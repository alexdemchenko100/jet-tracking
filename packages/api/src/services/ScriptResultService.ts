import { logger } from './../Context'
import { MonitorRunResult } from '@httpmon/db'
import { makeMonitorResultError } from 'src/utils/common'
import { saveMonitorResult } from './DBService'
import {
  publishMonitorRunMessage,
  publishOndemandResponseMessage,
  publishPostRequestMessage,
} from './PubSubService'

export async function handleScriptResult(monrun: MonitorRunResult) {
  if (monrun.err) {
    const result = makeMonitorResultError(monrun.mon, monrun.err?.msg)

    if (monrun.mon.status == 'ondemand') {
      //short-circuit ondemand error here
      publishOndemandResponseMessage({ ...monrun, result })
      return
    }

    //save error and quit
    const savedResult = await saveMonitorResult(result, monrun.mon)

    publishPostRequestMessage({ ...monrun, resultId: savedResult?.id })
    return
  }

  publishMonitorRunMessage(monrun)
}
