import { db, Monitor, MonitorRunResult } from '@httpmon/db'
import { sql } from 'kysely'
import { logger } from '../Context'
import { emitter } from './emitter'
import { runMonitor } from './MonitorRunner'
import { handlePostRequest } from './PostRequestService'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { makeMonitorResultError } from 'src/utils/common'
import { saveMonitorResult } from './DBService'

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
  logger.info('Setting Emitters for local pubsub simulation')

  emitter.on('monitor-prerequest', async (mon: Monitor) => {
    logger.info({ id: mon.id }, 'topic: monitor-prerequest')
    const monrun: MonitorRunResult = { mon, runId: uuidv4() }
    if (mon.preScript && mon.preScript.length > 0) {
      emitter.emit('api-script-run', monrun)
      return
    }

    emitter.emit('monitor-run', monrun)
  })

  emitter.on('api-script-run', async (monrun: MonitorRunResult) => {
    logger.info({ runId: monrun.runId }, 'topic: api-script-run')
    await handleRunScript(monrun)
  })

  emitter.on('api-script-result', async (monrun: MonitorRunResult) => {
    logger.info({ runId: monrun.runId }, 'topic: api-script-result')
    if (monrun.err) {
      const result = makeMonitorResultError(monrun.mon, monrun.err?.msg)
      //save error and quit
      saveMonitorResult(result)
      return
    }
    emitter.emit('monitor-run', monrun)
  })

  emitter.on('monitor-run', async (monrun: MonitorRunResult) => {
    logger.info({ runId: monrun.runId }, 'topic: monitor-run')
    await runMonitor(monrun)
  })

  emitter.on('monitor-postrequest', async (monrun: MonitorRunResult) => {
    logger.info({ runId: monrun.runId }, 'topic: monitor-postrequest')
    await handlePostRequest(monrun)
  })
}

async function handleRunScript(monrun: MonitorRunResult) {
  let resp: any
  try {
    resp = await axios.post('http://localhost:8081/test', {
      ...monrun,
    })
  } catch (e: any) {
    logger.error(e, 'Handling script run')
  }
  emitter.emit('api-script-result', resp.data)
}
