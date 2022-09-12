import { currentUserInfo } from '../Context'
import { db } from '@httpmon/db'

export async function getTeamMembers() {
  return await db
    .selectFrom('UserAccount')
    .selectAll()
    .where('userId', '=', currentUserInfo().userId)
    .execute()
}

export async function setPrimaryTeamMember(newDefaultAccountId: string) {
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
