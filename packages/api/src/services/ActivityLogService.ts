import { currentUserInfo } from '../Context'
import { db } from '@httpmon/db'

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
}
