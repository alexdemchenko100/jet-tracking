import { currentUserInfo } from '../Context'
import { nanoid } from 'nanoid'

import { db, NotificationState } from '@httpmon/db'
import { sql } from 'kysely'

export class ActivityLogService {
  static instance: ActivityLogService

  public static getInstance(): ActivityLogService {
    if (!ActivityLogService.instance) {
      ActivityLogService.instance = new ActivityLogService()
    }
    return ActivityLogService.instance
  }

  public async listLogs(offset: number, limit: number) {
    const { count } = db.fn
    const total = await db
      .selectFrom('NotificationState')
      .select(count<number>('id').as('count'))
      .where('accountId', '=', currentUserInfo().accountId)
      .execute()
    const logs = await db
      .selectFrom('NotificationState')
      .selectAll()
      .where('accountId', '=', currentUserInfo().accountId)
      .orderBy('createdAt', 'desc')
      .offset(offset)
      .limit(limit)
      .execute()
    return {
      total: total[0].count,
      items: logs,
    }
  }

  public async newLog(data: NotificationState) {
    console.log('activity data:')
    const log = await db
      .insertInto('NotificationState')
      .values({
        monitorId: data.monitorId,
        resultId: data.resultId,
        type: data.type,
        state: data.state,
        message: data.message,
        accountId: currentUserInfo().accountId,
      })
      .returningAll()
      .executeTakeFirst()

    return log
  }
}
