import { execMonitor } from './services/httpstats.js'
import { saveMonitorResult, selectReadyMonitors } from '@httpmon/db'
import { processAssertions } from './services/assertions.js'

export async function schedule() {
  //get all monitors matching current minute

  const now = new Date(Date.now())
  const curSeconds = now.getSeconds()
  const curMinutes = now.getMinutes()

  //for all active monitors matching minute mark

  //send each to SNS to execute the monitor
  //set the status to exec -- later

  //save to DB

  const monitors = await selectReadyMonitors()

  for (let i = 0; i < monitors.length; i++) {
    const mon = monitors[i]
    const result = await execMonitor(mon)

    //createdAt caused type issue for db
    await saveMonitorResult({ ...result })

    processAssertions(mon, result)
  }
}
