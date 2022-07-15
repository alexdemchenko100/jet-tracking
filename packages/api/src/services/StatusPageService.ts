import { currentUserInfo } from '../Context'

import { StatusPage, db } from '@httpmon/db'
import { nanoid, customAlphabet } from 'nanoid'

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
        url: `${process.env.STATUS_PAGE_DOMAIN_URL || ''}/${nanoId()}`,
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
}
