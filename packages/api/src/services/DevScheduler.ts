import { db, Monitor } from '@httpmon/db'
import { sql } from 'kysely'
import { logger } from '../Context'
import { emitter } from './emitter'
import { execMonitorAndProcessResponse } from './MonitorExecutor'
import { setupMonitorForExec } from './PreRequestScript'
import { handleMonitorResultErorr } from './NotificationService'
import { SynthEvent } from './EventService'

async function selectReadyMonitors() {
  const now = new Date(Date.now())
  // let's get to the closest 10 second using floor.
  // This helps when doing modulo math to figure out if a monitor is a hit to schedule
  const seconds = Math.floor((now.getMinutes() * 60 + now.getSeconds()) / 10) * 10

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

    emitter.emit('execPreScript', mon)
  }
}

export async function setupEmitterHandlers() {
  logger.info('* setting emitter *')

  emitter.on('execPreScript', async (mon: Monitor) => {
    logger.info('execPreScript')
    const newmon = await setupMonitorForExec(mon)
    if (newmon) emitter.emit('execAfterPreScript', newmon)
  })

  emitter.on('execAfterPreScript', async (mon: Monitor) => {
    logger.info('execAfterPreScript')
    await execMonitorAndProcessResponse(mon)
  })

  emitter.on('monitor-result-error', async (event: SynthEvent) => {
    await handleMonitorResultErorr(event)
  })
}
