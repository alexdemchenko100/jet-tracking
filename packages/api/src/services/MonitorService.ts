import { currentUserInfo } from './../Context'
import emitter from './emitter.js'

import { db, Monitor, MonitorTuples } from '@httpmon/db'
import { v4 as uuidv4 } from 'uuid'
import pino from 'pino'
import dayjs from 'dayjs'
import { sql } from 'kysely'
import { readObject } from './GSCService'

const logger = pino()

export interface ResultQueryString {
  startTime: string
  endTime: string
  limit?: number
  offset: number
  status?: string
  locations: string
  getTotals: boolean
}

export interface StatsQueryString {
  startDate: string
  endDate: string
  locations: string
}

/**
 *
 * Super hacky function to go around type safety
 * Since PG cannot take JSON arrays as is
 * (it converts them into PG array which is not what we want)
 * here, convert all JSON arrays into JSON as a string
 * @param mon
 * @returns
 */
function monitorToDBMonitor(mon: Monitor): Monitor {
  let values: { [k: string]: any } = { ...mon }
  if (values.headers) values.headers = JSON.stringify(values.headers)
  if (values.queryParams) values.queryParams = JSON.stringify(values.queryParams)
  if (values.variables) values.variables = JSON.stringify(values.variables)
  if (values.assertions) values.assertions = JSON.stringify(values.assertions)
  if (values.env) values.env = JSON.stringify(values.env)

  return values as Monitor
}

export class MonitorService {
  static instance: MonitorService

  public static getInstance(): MonitorService {
    if (!MonitorService.instance) {
      MonitorService.instance = new MonitorService()
    }
    return MonitorService.instance
  }

  public async create(mon: Monitor) {
    logger.info(mon, 'creating mon')

    const monResp = await db
      .insertInto('Monitor')
      .values({
        ...monitorToDBMonitor(mon),
        id: uuidv4(),
        accountId: currentUserInfo().accountId,
      })
      .returningAll()
      .executeTakeFirst()
    await db
      .insertInto('NotificationState')
      .values({
        monitorId: monResp?.id,
        type: 'MONITOR_CREATED',
        message: `Monitor ${mon.name} is created.`,
        accountId: currentUserInfo().accountId,
      })
      .returningAll()
      .executeTakeFirst()
    emitter.emit('monitor', monResp?.id)
    return monResp
  }

  public async update(mon: Monitor) {
    const accountId = currentUserInfo().accountId
    if (!accountId) throw new Error('Account id mismatch')

    let monResp
    await db.transaction().execute(async (trx) => {
      const origin = await trx
        .selectFrom('Monitor')
        .selectAll()
        .where('id', '=', mon.id)
        .where('accountId', '=', currentUserInfo().accountId)
        .executeTakeFirst()
      monResp = await trx
        .updateTable('Monitor')
        .set({ ...monitorToDBMonitor(mon) })
        .where('id', '=', mon.id)
        .returningAll()
        .executeTakeFirst()

      if (origin?.status !== mon.status) {
        if (mon.status == 'active') {
          await trx
            .insertInto('NotificationState')
            .values({
              monitorId: mon.id,
              type: 'MONITOR_UP',
              message: `Monitor ${mon.name} is active.`,
              accountId: currentUserInfo().accountId,
            })
            .returningAll()
            .executeTakeFirst()
        } else if (mon.status == 'paused') {
          await trx
            .insertInto('NotificationState')
            .values({
              monitorId: mon.id,
              type: 'MONITOR_PAUSED',
              message: `Monitor ${mon.name} is paused.`,
              accountId: currentUserInfo().accountId,
            })
            .returningAll()
            .executeTakeFirst()
        }
      }
    })
    return monResp
  }

  public async delete(id: string) {
    const accountId = currentUserInfo().accountId
    if (!accountId) throw new Error('Account id mismatch')
    const resp = await this.find(id)
    await db
      .insertInto('NotificationState')
      .values({
        monitorId: id,
        type: 'MONITOR_REMOVED',
        message: `Monitor ${resp?.name} is removed.`,
        accountId,
      })
      .returningAll()
      .executeTakeFirst()
    const monResults = await db
      .selectFrom('MonitorResult')
      .select(['id'])
      .where('monitorId', '=', id)
      .where('accountId', '=', accountId)
      .execute()
    emitter.emit('delete-cloud-storage-objects', { accountId, items: monResults })
    await db
      .deleteFrom('Monitor')
      .where('id', '=', id)
      .where('accountId', '=', accountId)
      .executeTakeFirst()
    return resp
  }

  public async find(id: string) {
    const monResp = await db
      .selectFrom('Monitor')
      .selectAll()
      .where('id', '=', id)
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
    return monResp
  }

  public async list(offset: number, limit: number) {
    const { count } = db.fn
    const total = await db
      .selectFrom('Monitor')
      .select(count<number>('id').as('count'))
      .where('accountId', '=', currentUserInfo().accountId)
      .execute()
    const monList = await db
      .selectFrom('Monitor')
      .selectAll()
      .where('accountId', '=', currentUserInfo().accountId)
      .offset(offset)
      .limit(limit)
      .execute()
    return {
      total: total[0].count,
      items: monList,
    }
  }

  public async findResult(id: string) {
    const monResultResp = await db
      .selectFrom('MonitorResult')
      .selectAll()
      .where('id', '=', id)
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
    const bodyData = await readObject(currentUserInfo().accountId, id, 'body')
    return {
      ...monResultResp,
      body: bodyData,
    }
  }

  /**
   * Reads the last 100 monitor results for the given monitor
   *
   * Ideally:
   *
   * - We should be able to query for results in a given time range
   *  (e.g. last 15 mins, 1 hour, 3 hours, 1 day, 7 days, 30 days, custom range)
   *
   * - We should be able to query for results for a given location
   * - We should be able to query for results for successful or failed
   *
   */
  public async getMonitorResults(monitorId?: string) {
    //having a const column array causes type error which is weird
    const results = await db
      .selectFrom('MonitorResult')
      .select([
        'id',
        'monitorId',
        'url',
        'code',
        'codeStatus',
        'createdAt',
        'waitTime',
        'dnsTime',
        'tcpTime',
        'tlsTime',
        'uploadTime',
        'ttfb',
        'downloadTime',
        'totalTime',
        'ip',
        'location',
        'err',
        'protocol',
        'ttfb',
        'assertResults',
      ])
      .if(Boolean(monitorId), (qb) => qb.where('monitorId', '=', monitorId as string))
      .where('accountId', '=', currentUserInfo().accountId)
      .limit(100)
      .orderBy('MonitorResult.createdAt', 'desc')
      .execute()

    return results
  }

  public async getMonitorResultsEx(monitorId: string, query: ResultQueryString) {
    const locations = query.locations ? query.locations.split(',') : []
    const okStatus = query.status?.includes('ok') ?? false
    const errStatus = query.status?.includes('err') ?? false

    logger.error(query, 'query')
    logger.error(okStatus, 'okStatus')
    logger.error(errStatus, 'errStatus')

    //having a const column array causes type error which is weird
    let q = db
      .selectFrom('MonitorResult')
      .if(Boolean(monitorId), (qb) => qb.where('monitorId', '=', monitorId as string))
      .where('accountId', '=', currentUserInfo().accountId)
      .where('createdAt', '>=', new Date(query.startTime))
      .where('createdAt', '<', new Date(query.endTime))
      .if(locations.length > 0, (qb) => qb.where('location', 'in', locations))

    if (okStatus || errStatus) {
      if (okStatus && errStatus) {
        q = q.where((qb) => qb.where('err', '<>', '').orWhere('err', '=', ''))
      } else if (okStatus) {
        q = q.where((qb) => qb.where('err', '=', ''))
      } else {
        q = q.where((qb) => qb.where('err', '<>', ''))
      }
    }

    let queryResults = q
      .select([
        'id',
        'monitorId',
        'url',
        'code',
        'codeStatus',
        'createdAt',
        'waitTime',
        'dnsTime',
        'tcpTime',
        'tlsTime',
        'uploadTime',
        'ttfb',
        'downloadTime',
        'totalTime',
        'ip',
        'location',
        'err',
        'protocol',
        'ttfb',
        'assertResults',
      ])
      .orderBy('MonitorResult.createdAt', 'desc')
      .offset(query.offset)
      .if(query.limit != undefined, (qb) => qb.limit(query.limit as number))

    logger.error(q.compile().sql, 'q')

    const { count } = db.fn
    logger.error(q.select(count<number>('createdAt').as('numItems')).compile().sql, 'sql')

    if (query.getTotals) {
      let queryTotals = await q.select(count<number>('createdAt').as('numItems')).execute()
      return {
        items: await queryResults.execute(),
        totalItemCount: queryTotals[0].numItems,
      }
    } else {
      return {
        items: await queryResults.execute(),
      }
    }
  }

  public async getMonitorStatSummary(monitorId: string) {
    const { avg, count } = db.fn

    const weekAgoStartime = dayjs().subtract(7, 'day').toDate()
    const dayAgoStartime = dayjs().subtract(1, 'day').toDate()
    const now = dayjs().toDate()

    //having a const column array causes type error which is weird
    const queryStats = db
      .selectFrom('MonitorResult')
      .select(sql<string>`PERCENTILE_CONT(0.5) WITHIN GROUP (order by "totalTime")`.as('p50'))
      .select(sql<string>`PERCENTILE_CONT(0.95) WITHIN GROUP (order by "totalTime")`.as('p95'))
      .select(avg<number>('totalTime').as('avg'))
      .select(count<number>('totalTime').as('numItems'))
      .select(sql<string>`sum(CASE WHEN err <> '' THEN 1 ELSE 0 END)`.as('numErrors'))
      .where('monitorId', '=', monitorId)
      .where('accountId', '=', currentUserInfo().accountId)

    const weekAgo = queryStats
      .where('createdAt', '>', weekAgoStartime)
      .where('createdAt', '<=', now)

    let weekResults = await weekAgo.executeTakeFirst()

    const dayAgo = queryStats.where('createdAt', '>', dayAgoStartime).where('createdAt', '<=', now)

    let dayResults = await dayAgo.executeTakeFirst()

    const lastResultsArray = await db
      .selectFrom('MonitorResult')
      .select(['id', 'err', 'location', 'totalTime'])
      .where('monitorId', '=', monitorId)
      .where('accountId', '=', currentUserInfo().accountId)
      .orderBy('createdAt', 'desc')
      .limit(24)
      .execute()

    const monitor = await this.find(monitorId)

    const lastResults = lastResultsArray.filter((res) => {
      return {
        id: res.id,
        err: res.err,
        totalTime: res.totalTime,
        location: res.location,
      }
    })

    let status = 'unknown'
    if (monitor) {
      if (monitor.status == 'paused') {
        status = 'paused'
      } else if (lastResults.length) {
        status = lastResults[0].err ? 'down' : 'up'
      }
    }

    let res = {
      monitorId: monitorId,
      status: status,
      week: weekResults,
      day: dayResults,
      lastResults: lastResults,
    }

    return res
  }

  public async getAllMonitorStatSummaries() {
    const monitors = await db
      .selectFrom('Monitor')
      .selectAll()
      .where('accountId', '=', currentUserInfo().accountId)
      .execute()

    const results = await Promise.all(
      monitors.map(async (monitor) => {
        return await this.getMonitorStatSummary(monitor.id as string)
      })
    )
    return results
  }

  public async getMonitorStatsByPeriod(monitorId: string, query: StatsQueryString) {
    const { avg, count } = db.fn

    //having a const column array causes type error which is weird
    const queryStats = db
      .selectFrom('MonitorResult')
      .select(sql<string>`PERCENTILE_CONT(0.5) WITHIN GROUP (order by "totalTime")`.as('p50'))
      .select(sql<string>`PERCENTILE_CONT(0.95) WITHIN GROUP (order by "totalTime")`.as('p95'))
      .select(avg<number>('totalTime').as('avg'))
      .select(count<number>('totalTime').as('numItems'))
      .select(sql<string>`sum(CASE WHEN err <> '' THEN 1 ELSE 0 END)`.as('numErrors'))
      .where('monitorId', '=', monitorId)
      .where('accountId', '=', currentUserInfo().accountId)
      .where('createdAt', '>', query.startDate)
      .where('createdAt', '<=', query.endDate)

    const results = await queryStats.executeTakeFirst()
    return results
  }

  public async setVariables(monitorId: string, variables: MonitorTuples) {
    await db
      .updateTable('Monitor')
      .set({ variables: JSON.stringify(variables) as any })
      .where('id', '=', monitorId)
      .where('accountId', '=', currentUserInfo().accountId)
      .execute()
  }
}
