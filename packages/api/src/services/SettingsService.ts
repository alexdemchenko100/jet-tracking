import { currentUserInfo } from './../Context'

import { Settings, db, NotificationChannel } from '@httpmon/db'
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
      .selectFrom('NotificationChannel')
      .selectAll()
      .where('accountId', '=', currentUserInfo().accountId)
      .execute()
    return notifications
  }

  public async saveNotifcation(data: NotificationChannel) {
    const notification = await db
      .insertInto('NotificationChannel')
      .values({
        id: nanoid(),
        name: data.name,
        isDefaultEnabled: data.isDefaultEnabled,
        applyOnExistingMonitors: data.applyOnExistingMonitors,
        channel: data.channel,
        accountId: currentUserInfo().accountId,
      })
      .returningAll()
      .executeTakeFirst()

    return notification
  }

  public async updateNotifcation(id: string, data: NotificationChannel) {
    const notification = await db
      .updateTable('NotificationChannel')
      .set({ ...data })
      .where('id', '=', id)
      .where('accountId', '=', currentUserInfo().accountId)
      .returningAll()
      .executeTakeFirst()

    return notification
  }

  public async deleteNotification(id: string) {
    const resp = await db
      .deleteFrom('NotificationChannel')
      .where('id', '=', id)
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
    return resp.numDeletedRows
  }

  public async getSettings() {
    const settings = await db
      .selectFrom('Settings')
      .selectAll()
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
    return settings
  }

  public async saveNewSettings(accountId: string) {
    const settings = await db
      .insertInto('Settings')
      .values({
        id: nanoid(),
        alert: { failCount: 1, failTimeMinutes: 0 },
        accountId,
      })
      .returningAll()
      .executeTakeFirst()

    return settings
  }

  public async updateSettings(data: Settings) {
    const settings = await db
      .updateTable('Settings')
      .set({ ...data })
      .where('accountId', '=', currentUserInfo().accountId)
      .returningAll()
      .executeTakeFirst()

    return settings
  }

}
