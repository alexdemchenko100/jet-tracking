import { currentUserInfo } from './../Context'

import { Settings, db, NotificationChannel, NotificationEmail, UserAccount } from '@httpmon/db'
import { nanoid } from 'nanoid'
import { sendVerificationEmail } from './SendgridService'
import dayjs from 'dayjs'
import { sql } from 'kysely'
import { UserInvite } from '../types'
import { firebaseAuth } from '../Firebase'
import { createNewAccount } from './DBService'

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

    // Update monitors' notifications field that use global settings
    const globalSettingMonitors = await db
      .selectFrom('Monitor')
      .select(['id'])
      .where(sql<string>`notifications -> 'useGlobal' = 'true'`)
      .where('accountId', '=', currentUserInfo().accountId)
      .execute()
    if (globalSettingMonitors && globalSettingMonitors.length > 0) {
      const ids = globalSettingMonitors.map((mon) => mon.id)
      await db
        .updateTable('Monitor')
        .set({
          notifications: sql`jsonb_set(jsonb_set(notifications, '{failCount}', ${
            data.alert.failCount ?? 0
          }), '{failTimeMinutes}', ${data.alert.failTimeMinutes ?? 0})`,
        })
        .where('accountId', '=', currentUserInfo().accountId)
        .where('id', 'in', ids)
        .returningAll()
        .execute()
    }
    return settings
  }

  public async listNotificationEmails(status: string) {
    let data = [] as NotificationEmail[]
    const dayAgoStartime = dayjs().subtract(1, 'day').toDate()
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
          .where('createdAt', '>=', dayAgoStartime)
          .execute()
        break
      case 'expired':
        data = await db
          .selectFrom('NotificationEmail')
          .selectAll()
          .where('accountId', '=', currentUserInfo().accountId)
          .where('isVerified', '=', false)
          .where('createdAt', '<', dayAgoStartime)
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

  public async verifyUser(email: string, accountId: string, token: string) {
    const defaultUser = await db
      .selectFrom('UserAccount')
      .select(['id'])
      .where('email', '=', email)
      .where('default', '=', true)
      .executeTakeFirst()
    const resp = await db
      .selectFrom('UserAccount')
      .select(['id', 'isVerified', 'token'])
      .where('email', '=', email)
      .where('accountId', '=', accountId)
      .executeTakeFirst()
    let status = 'failed'
    if (resp?.isVerified) {
      status = 'already_verified'
    }
    if (resp?.id && token === resp?.token) {
      await db
        .updateTable('UserAccount')
        .set({ isVerified: true })
        .where('id', '=', resp?.id)
        .returningAll()
        .executeTakeFirst()
      status = 'success'
    }
    return {
      hasDefaultUser: !!defaultUser,
      status,
    }
  }

  public async listUsers() {
    const dayAgoStartime = dayjs().subtract(1, 'day').toDate()
    const userAccounts = await db
      .selectFrom('UserAccount')
      .selectAll()
      .where('accountId', '=', currentUserInfo().accountId)
      .where('default', '=', false)
      .execute()
    const notificationEmails = await db
      .selectFrom('NotificationEmail')
      .selectAll()
      .where('accountId', '=', currentUserInfo().accountId)
      .execute()
    const data = [...userAccounts, ...notificationEmails] as UserAccount[]
    data.forEach((item) => {
      if (item.isVerified) {
        item.status = 'verified'
      } else if (item.createdAt && item.createdAt < dayAgoStartime) {
        item.status = 'expired'
      } else {
        item.status = 'unverified'
      }
      if (!item.role) {
        item.role = 'notifications'
      }
    })
    return data
  }

  public async sendUserInvite(data: UserInvite, token: string) {
    await db
      .insertInto('UserAccount')
      .values({
        id: nanoid(),
        email: data.email,
        accountId: currentUserInfo().accountId,
        default: false,
        role: data.role,
        isVerified: false,
        token,
      })
      .returningAll()
      .executeTakeFirst()
    await sendVerificationEmail(data.email, token, currentUserInfo().accountId, true)
  }

  public async updateUserRole(id: string, role: string) {
    const user = await db
      .updateTable('UserAccount')
      .set({ role: role })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
    return user
  }

  public async createUser(email: string, password: string, displayName: string) {
    // Check if the default user with email address exists.
    const resp = await db
      .selectFrom('UserAccount')
      .select(['id'])
      .where('email', '=', email)
      .where('default', '=', true)
      .executeTakeFirst()
    if (!resp) {
      const user = await firebaseAuth.createUser({
        email,
        password,
        displayName,
        emailVerified: true,
      })
      await createNewAccount(user.uid, email)
      return user
    }
    return null
  }

  public async getTeams(email: string) {
    const teams = await db
      .selectFrom('UserAccount')
      .selectAll()
      .where('email', '=', email)
      .execute()
    return teams
  }

  public async deleteUser(id: string) {
    const resp = await db
      .deleteFrom('UserAccount')
      .where('id', '=', id)
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
    return resp.numDeletedRows
  }
}
