import { db, Monitor } from '@httpmon/db'
import { sql } from 'kysely'
import { logger } from '../Context'
import { emitter } from './emitter'
import { runMonitor } from './MonitorRunner'
import { handlePreRequest } from './PreRequestService'
import { handlePostRequest } from './PostRequestService'
import { MonitorResultEvent } from './EventService'

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

    emitter.emit('monitor-prerequest', mon)
  }
}

export async function setupEmitterHandlers() {
  logger.info('* setting emitter *')

  emitter.on('monitor-prerequest', async (mon: Monitor) => {
    logger.info(`${mon.name} - ${mon.url}`, 'monitor-prerequest')
    const newmon = await handlePreRequest(mon)
    if (newmon) emitter.emit('monitor-run', newmon)
  })

  emitter.on('monitor-run', async (mon: Monitor) => {
    logger.info('monitor')
    await runMonitor(mon)
  })

  emitter.on('monitor-postrequest', async (event: MonitorResultEvent) => {
    await handlePostRequest(event)
  })
}
