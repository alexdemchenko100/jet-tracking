import { db } from '@httpmon/db'
import { nanoid } from 'nanoid'

import { logger } from '../Context'

export const getAccountIdByUser = async (userId: string) => {
  const resp = await db
    .selectFrom('UserAccount')
    .selectAll()
    .where('userId', '=', userId)
    .executeTakeFirst()

  return resp?.accountId
}

export const createAccountIdByUser = async (userId: string, email: string) => {
  let newAccountId = ''

  await db.transaction().execute(async (trx) => {
    //create account
    const account = await trx
      .insertInto('Account')
      .values({ id: nanoid(), name: userId })
      .returningAll()
      .executeTakeFirst()

    if (!account || !account.id) {
      throw new Error('not able to create account')
    }

    const userAccount = await trx
      .insertInto('UserAccount')
      .values({
        id: nanoid(),
        userId: userId,
        email: email,
        accountId: account.id,
        default: true,
        role: 'admin',
      })
      .returningAll()
      .executeTakeFirst()

    if (!userAccount || !userAccount.id) {
      throw new Error('not able to add to user account')
    }
    newAccountId = userAccount.accountId
    logger.info(
      `created new account for user ${userId} ${email} account id ${newAccountId}`
    )
  })

  return newAccountId
}
