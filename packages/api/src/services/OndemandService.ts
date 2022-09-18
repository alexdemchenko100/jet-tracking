import { logger } from './../Context'
import { v4 as uuidv4 } from 'uuid'
import { db, Monitor, MonitorRunResult } from '@httpmon/db'
import { emitter } from './emitter'

const OndemandRunList: { [k: string]: any } = {}

export async function runOndemand(mon: Monitor) {
  let timer: NodeJS.Timeout
  const timeoutPromise = new Promise((_resolve, reject) => {
    timer = setTimeout(reject, 10000, { err: 'timed out' })
  })

  const odPromise = new Promise((odResolve, odReject) => {
    mon.id = 'ondemand-' + uuidv4()

    OndemandRunList[mon.id] = { odResolve: odResolve, odReject: odReject, timer }

    if (process.env.NODE_ENV != 'production') {
      emitter.emit('monitor-prerequest', mon)
    }
  })

  return Promise.race([odPromise, timeoutPromise])
}

export async function handleOndemandResult(monrun: MonitorRunResult) {
  if (!monrun.mon.id) return

  const entry = OndemandRunList[monrun.mon.id]

  if (entry) {
    const res = await db
      .selectFrom('OndemandResult')
      .selectAll()
      .where('id', '=', monrun.resultId)
      .executeTakeFirst()

    entry.odResolve(res)
    clearTimeout(entry.timer)

    delete OndemandRunList[monrun.mon.id]

    //aslo delete db entry.  we don't want to accumulated cruft in db
    if (res && res.id && process.env.NODE_ENV == 'production') {
      await db.deleteFrom('OndemandResult').where('id', '=', res.id).executeTakeFirst()
    }
  }
}
