import { currentUserInfo } from './../Context'

import { db, Notification } from '@httpmon/db'
import { nanoid } from 'nanoid'

export class SettingsService {
  static instance: SettingsService

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService()
    }
    return SettingsService.instance
  }

  public async listNotifications() {
    const notifications = await db
      .selectFrom('Notification')
      .selectAll()
      .where('accountId', '=', currentUserInfo().accountId)
      .execute()
    return notifications
  }

  public async saveNotifcation(data: Notification) {
    const notification = await db
      .insertInto('Notification')
      .values({
        id: nanoid(),
        name: data.name,
        failCount: data.failCount,
        failTimeMS: data.failTimeMS,
        isDefaultEnabled: data.isDefaultEnabled,
        applyOnExistingMonitors: data.applyOnExistingMonitors,
        channel: data.channel,
        accountId: currentUserInfo().accountId,
      })
      .returningAll()
      .executeTakeFirst()

    return notification
  }

}
