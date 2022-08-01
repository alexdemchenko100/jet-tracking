import { currentUserInfo } from '../Context'

import { StatusPage, db, Monitor } from '@httpmon/db'
import { nanoid, customAlphabet } from 'nanoid'
import dayjs from 'dayjs'
import { sql } from 'kysely'

export class StatusPageService {
  static instance: StatusPageService

  public static getInstance(): StatusPageService {
    if (!StatusPageService.instance) {
      StatusPageService.instance = new StatusPageService()
    }
    return StatusPageService.instance
  }

  public async listStatusPages() {
    const statusPages = await db
      .selectFrom('StatusPage')
      .selectAll()
      .select(
        sql`CONCAT(${sql.literal(process.env.STATUS_PAGE_DOMAIN_URL)}, '/', url)`.as('siteUrl')
      )
      .where('accountId', '=', currentUserInfo().accountId)
      .execute()
    return statusPages
  }

  public async newStatusPage(data: StatusPage) {
    const nanoId = customAlphabet('abcdefghijklmnopqrstuvwxyz-', 24)
    const statusPage = await db
      .insertInto('StatusPage')
      .values({
        id: nanoid(),
        name: data.name,
        logoUrl: data.logoUrl,
        monitors: data.monitors,
        accountId: currentUserInfo().accountId,
        url: nanoId(),
      })
      .returningAll()
      .executeTakeFirst()

    return statusPage
  }

  public async getStatusPage(id: string) {
    const statusPage = await db
      .selectFrom('StatusPage')
      .selectAll()
      .where('accountId', '=', currentUserInfo().accountId)
      .where('id', '=', id)
      .executeTakeFirst()
    const monitors = await db
      .selectFrom('Monitor')
      .selectAll()
      .where('id', 'in', statusPage?.monitors)
      .execute()
    return {
      ...statusPage,
      monitors,
    }
  }

  public async updateStatusPage(id: string, data: StatusPage) {
    const statusPage = await db
      .updateTable('StatusPage')
      .set({ ...data })
      .where('id', '=', id)
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
    return statusPage
  }

  public async deleteStatusPage(id: string) {
    const resp = await db
      .deleteFrom('StatusPage')
      .where('id', '=', id)
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
    return resp.numDeletedRows
  }

  async getMonitorStatSummary(monitor: Monitor) {
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
      .where('monitorId', '=', monitor.id || '')

    const weekAgo = queryStats
      .where('createdAt', '>', weekAgoStartime)
      .where('createdAt', '<=', now)

    let weekResults = await weekAgo.executeTakeFirst()

    const dayAgo = queryStats.where('createdAt', '>', dayAgoStartime).where('createdAt', '<=', now)

    let dayResults = await dayAgo.executeTakeFirst()

    const lastResultsArray = await db
      .selectFrom('MonitorResult')
      .select(['id', 'err', 'location', 'totalTime'])
      .where('monitorId', '=', monitor.id || '')
      .orderBy('createdAt', 'desc')
      .limit(24)
      .execute()

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

    return {
      monitorId: monitor.id,
      monitorName: monitor.name,
      status: status,
      week: weekResults,
      day: dayResults,
      lastResults: lastResults,
    }
  }

  public async getStatusPageFromUrl(url: string) {
    const statusPage = await db
      .selectFrom('StatusPage')
      .selectAll()
      .where('url', '=', url)
      .executeTakeFirst()
    if (statusPage) {
      const monitors = await db
        .selectFrom('Monitor')
        .selectAll()
        .where('id', 'in', statusPage?.monitors || [])
        .execute()

      const results = await Promise.all(
        monitors.map((monitor) => {
          return this.getMonitorStatSummary(monitor)
        })
      )
      return {
        ...statusPage,
        monitors: results,
      }
    }
    return
  }
}
