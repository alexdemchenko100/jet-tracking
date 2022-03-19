import { saveMonitorResult, db } from '@httpmon/db'
import { sql } from 'kysely'
import { processAssertions } from './assertions'
import { execMonitor } from './monitor-exec'

async function selectReadyMonitors() {
  const now = new Date(Date.now())
  // let's get to the closest 10 second using floor.
  // This helps when doing modulo math to figure out if a monitor is a hit to schedule
  const seconds =
    Math.floor((now.getMinutes() * 60 + now.getSeconds()) / 10) * 10

  const resp = await db
    .selectFrom('Monitor')
    .selectAll()
    .where('status', '=', 'active')
    .where(sql`${seconds} % frequency`, '=', 0)
    .execute()

  return resp
}

export async function schedule() {
  //get all monitors matching current minute
  //for all active monitors matching minute mark
  const monitors = await selectReadyMonitors()

  for (let i = 0; i < monitors.length; i++) {
    const mon = monitors[i]

    const result = await execMonitor(mon)

    if (result.err == '') {
      const asserionResults = processAssertions(mon, result)
      result.assertResults = asserionResults
    }

    //save to DB
    //createdAt caused type issue for db
    await saveMonitorResult({ ...result })
  }
}
