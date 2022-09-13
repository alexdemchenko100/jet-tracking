import { currentUserInfo } from './../Context'
import { Settings, db, NotificationChannel, UIState } from '@httpmon/db'
import { nanoid } from 'nanoid'
import { sql } from 'kysely'
import { UserUpdate } from '../types'
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

  public async verifyUser(email: string, accountId: string, token: string) {
    const defaultUser = await db
      .selectFrom('UserAccount')
      .select(['id'])
      .where('email', '=', email)
      .where('isPrimary', '=', true)
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

  public async createUser(email: string, password: string, displayName: string) {
    // Check if the default user with email address exists.
    const resp = await db
      .selectFrom('UserAccount')
      .select(['id'])
      .where('email', '=', email)
      .where('isPrimary', '=', true)
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

  public async getTeams() {
    return await db
      .selectFrom('UserAccount')
      .selectAll()
      .where('userId', '=', currentUserInfo().userId)
      .execute()
  }

  public async deleteUser(id: string) {
    const resp = await db
      .deleteFrom('UserAccount')
      .where('id', '=', id)
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
    return resp.numDeletedRows
  }

  public async changeDefaultTeam(newDefaultAccountId: string) {
    await db.transaction().execute(async (trx) => {
      await trx
        .updateTable('UserAccount')
        .set({ isPrimary: true })
        .where('accountId', '=', newDefaultAccountId)
        .where('userId', '=', currentUserInfo().userId)
        .execute()

      await trx
        .updateTable('UserAccount')
        .set({ isPrimary: false })
        .where('accountId', '<>', newDefaultAccountId)
        .where('userId', '=', currentUserInfo().userId)
        .execute()
    })
  }

  public async getUIStateSetting() {
    const settings = await db
      .selectFrom('Settings')
      .select(['uiState'])
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
    return settings?.uiState
  }

  public async updateUIStateSetting(uiState: UIState) {
    const res = await db
      .updateTable('Settings')
      .set({ uiState })
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
    return res.numUpdatedRows
  }
}
