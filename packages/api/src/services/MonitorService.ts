import emitter from './emitter.js'

import { db, Monitor, MonitorResult, MonitorTuples } from '@httpmon/db'
import { nanoid } from 'nanoid'
import pino from 'pino'
import dayjs from 'dayjs'
import { sql } from 'kysely'

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
  if (values.queryParams)
    values.queryParams = JSON.stringify(values.queryParams)
  if (values.env) values.env = JSON.stringify(values.env)
  if (values.assertions) values.assertions = JSON.stringify(values.assertions)

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
      .values({ ...monitorToDBMonitor(mon), id: nanoid() })
      .returningAll()
      .executeTakeFirst()

    emitter.emit('monitor', monResp?.id)
    return monResp
  }

  public async update(mon: Monitor) {
    const monResp = await db
      .updateTable('Monitor')
      .set({ ...monitorToDBMonitor(mon) })
      .where('id', '=', mon.id)
      .returningAll()
      .executeTakeFirst()
    return monResp
  }

  public async delete(id: string) {
    const resp = await db
      .deleteFrom('Monitor')
      .where('id', '=', id)
      .executeTakeFirst()
    return resp.numDeletedRows
  }

  public async find(id: string) {
    const monResp = await db
      .selectFrom('Monitor')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()
    return monResp
  }

  public async list() {
    const monList = await db.selectFrom('Monitor').selectAll().execute()
    return monList
  }

  public async findResult(id: string) {
    const monResultResp = await db
      .selectFrom('MonitorResult')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()
    return monResultResp
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
      .if(Boolean(monitorId), (qb) =>
        qb.where('monitorId', '=', monitorId as string)
      )
      .limit(100)
      .orderBy('MonitorResult.createdAt', 'desc')
      .execute()

    return results
  }

  public async getMonitorResultsEx(
    monitorId: string,
    query: ResultQueryString
  ) {
    const locations = query.locations ? query.locations.split(',') : []
    const okStatus = query.status?.includes('ok') ?? false
    const errStatus = query.status?.includes('err') ?? false

    logger.error(query, 'query')
    logger.error(okStatus, 'okStatus')
    logger.error(errStatus, 'errStatus')

    //having a const column array causes type error which is weird
    let q = db
      .selectFrom('MonitorResult')
      .if(Boolean(monitorId), (qb) =>
        qb.where('monitorId', '=', monitorId as string)
      )
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
    logger.error(
      q.select(count<number>('createdAt').as('numItems')).compile().sql,
      'sql'
    )

    if (query.getTotals) {
      let queryTotals = await q
        .select(count<number>('createdAt').as('numItems'))
        .execute()
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
      .select(
        sql<string>`PERCENTILE_CONT(0.5) WITHIN GROUP (order by "totalTime")`.as(
          'p50'
        )
      )
      .select(
        sql<string>`PERCENTILE_CONT(0.95) WITHIN GROUP (order by "totalTime")`.as(
          'p95'
        )
      )
      .select(avg<number>('totalTime').as('avg'))
      .select(count<number>('totalTime').as('numItems'))
      .select(
        sql<string>`sum(CASE WHEN err <> '' THEN 1 ELSE 0 END)`.as('numErrors')
      )
      .where('monitorId', '=', monitorId)

    const weekAgo = queryStats
      .where('createdAt', '>', weekAgoStartime)
      .where('createdAt', '<=', now)

    let weekResults = await weekAgo.executeTakeFirst()

    const dayAgo = queryStats
      .where('createdAt', '>', dayAgoStartime)
      .where('createdAt', '<=', now)

    let dayResults = await dayAgo.executeTakeFirst()

    const lastResults = await db
      .selectFrom('MonitorResult')
      .select(['id', 'err', 'location', 'totalTime'])
      .where('monitorId', '=', monitorId)
      .orderBy('createdAt', 'desc')
      .limit(12)
      .execute()

    let res = {
      monitorId: monitorId,
      week: weekResults,
      day: dayResults,
      lastResults: lastResults.filter((res) => {
        return {
          id: res.id,
          err: res.err,
          totalTime: res.totalTime,
          location: res.location,
        }
      }),
    }

    logger.error(JSON.stringify(res), 'res')
    return res
  }

  public async getAllMonitorStatSummaries() {
    const monitors = await this.list()

    const results = await Promise.all(
      monitors.map(async (monitor) => {
        return await this.getMonitorStatSummary(monitor.id as string)
      })
    )
    return results
  }

  public async getMonitorStatsByPeriod(
    monitorId: string,
    query: StatsQueryString
  ) {
    const { avg, count } = db.fn

    //having a const column array causes type error which is weird
    const queryStats = db
      .selectFrom('MonitorResult')
      .select(
        sql<string>`PERCENTILE_CONT(0.5) WITHIN GROUP (order by "totalTime")`.as(
          'p50'
        )
      )
      .select(
        sql<string>`PERCENTILE_CONT(0.95) WITHIN GROUP (order by "totalTime")`.as(
          'p95'
        )
      )
      .select(avg<number>('totalTime').as('avg'))
      .select(count<number>('totalTime').as('numItems'))
      .select(
        sql<string>`sum(CASE WHEN err <> '' THEN 1 ELSE 0 END)`.as('numErrors')
      )
      .where('monitorId', '=', monitorId)
      .where('createdAt', '>', query.startDate)
      .where('createdAt', '<=', query.endDate)

    const results = await queryStats.executeTakeFirst()
    return results
  }

  public async setEnv(monitorId: string, env: MonitorTuples) {
    await db
      .updateTable('Monitor')
      .set({ env: JSON.stringify(env) as any })
      .where('id', '=', monitorId)
      .execute()
  }
}
