import { currentUserInfo } from './../Context'

import { Settings, db, NotificationChannel, NotificationEmail } from '@httpmon/db'
import { nanoid } from 'nanoid'
import { sendVerificationEmail } from './SendgridService'

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

  public async listNotificationEmails(status: string) {
    let data = [] as NotificationEmail[]
    const yesterday = new Date(new Date().getTime() - 86400000)
    switch (status) {
      case 'verified':
        data = await db
          .selectFrom('NotificationEmail')
          .selectAll()
          .where('accountId', '=', currentUserInfo().accountId)
          .where('isVerified', '=', true)
          .execute()
        break
      case 'unverified':
        data = await db
          .selectFrom('NotificationEmail')
          .selectAll()
          .where('accountId', '=', currentUserInfo().accountId)
          .where('isVerified', '=', false)
          .where('createdAt', '>=', yesterday)
          .execute()
        break
      case 'expired':
        data = await db
          .selectFrom('NotificationEmail')
          .selectAll()
          .where('accountId', '=', currentUserInfo().accountId)
          .where('isVerified', '=', false)
          .where('createdAt', '<', yesterday)
          .execute()
        break
      default:
    }
    return data
  }

  public async saveNotifcationEmail(data: NotificationEmail, token: string) {
    const notification = await db
      .insertInto('NotificationEmail')
      .values({
        id: nanoid(),
        email: data.email,
        isVerified: data.isVerified,
        token: token,
        accountId: currentUserInfo().accountId,
      })
      .returningAll()
      .executeTakeFirst()
    await sendVerificationEmail(data.email, token)
    return notification
  }

  public async deleteNotificationEmail(id: string) {
    const result = await db
      .selectFrom('NotificationEmail')
      .select(['email'])
      .where('id', '=', id)
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
    const resp = await db
      .deleteFrom('NotificationEmail')
      .where('id', '=', id)
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
    await db
      .deleteFrom('NotificationChannel')
      .where('channel', '=', { type: 'email', email: result?.email || '' })
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
    return resp.numDeletedRows
  }

  public async resendVerificationMail(email: string, token: string) {
    await db
      .updateTable('NotificationEmail')
      .set({ token: token })
      .where('email', '=', email)
      .where('accountId', '=', currentUserInfo().accountId)
      .returningAll()
      .executeTakeFirst()
    const resp = await sendVerificationEmail(email, token)
    return resp
  }

  public async verifyEmail(email: string, token: string) {
    const resp = await db
      .selectFrom('NotificationEmail')
      .select(['id', 'isVerified', 'token'])
      .where('email', '=', email)
      .executeTakeFirst()
    if (resp?.isVerified) {
      return 'already_verified'
    }
    if (resp?.id && token === resp?.token) {
      await db
        .updateTable('NotificationEmail')
        .set({ isVerified: true, token: null })
        .where('id', '=', resp?.id)
        .returningAll()
        .executeTakeFirst()
      return 'success'
    }
    return 'failed'
  }
}
