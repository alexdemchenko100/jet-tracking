import { db, MonitorResultTable } from '@httpmon/db'
import { Insertable } from 'kysely'
import { nanoid } from 'nanoid'
import { logger } from '../Context'
import { createStripeCustomer } from '../services/StripeService'

export const getAccountIdByUser = async (userId: string) => {
  const resp = await db
    .selectFrom('UserAccount')
    .selectAll()
    .where('userId', '=', userId)
    .executeTakeFirst()

  return resp?.accountId
}

export const createNewAccount = async (userId: string, email: string) => {
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

    // create new stripe customer
    const customer = await createStripeCustomer(userId, email)

    const userAccount = await trx
      .insertInto('UserAccount')
      .values({
        id: nanoid(),
        userId: userId,
        email: email,
        accountId: account.id,
        default: true,
        role: 'admin',
        isVerified: false,
        stripeCustomerId: customer.id,
      })
      .returningAll()
      .executeTakeFirst()

    if (!userAccount || !userAccount.id) {
      throw new Error('not able to add to user account')
    }
    newAccountId = userAccount.accountId

    // Add settings for new user account
    await trx
      .insertInto('Settings')
      .values({
        id: nanoid(),
        accountId: account.id,
        alert: { failCount: 1, failTimeMinutes: 0 },
      })
      .returningAll()
      .executeTakeFirst()

    // Set free plan to new user account
    await trx
      .insertInto('BillingInfo')
      .values({
        id: nanoid(),
        accountId: account.id,
        billingPlanType: 'free',
        monitorRunsLimit: 5000,
      })
      .returningAll()
      .executeTakeFirst()

    logger.info(`created new account for user ${userId} ${email} account id ${newAccountId}`)
  })

  return newAccountId
}

function objectToJSON(object: any) {
  if (typeof object == 'string') {
    return object
  } else if (typeof object == 'object') {
    return JSON.stringify(object)
  }
  throw Error('Cannot convert to JSON')
}

export async function saveMonitorResult(result: Insertable<MonitorResultTable>) {
  //Handle all JSON conversions here.. headers, cookies, variables etc
  let resultForSaving = {
    ...result,
    headers: objectToJSON(result.headers),
  }

  if (result.assertResults) {
    resultForSaving = {
      ...resultForSaving,
      assertResults: objectToJSON(result.assertResults),
    }
  }

  try {
    return await db
      .insertInto('MonitorResult')
      .values(resultForSaving)
      .returningAll()
      .executeTakeFirst()
  } catch (e) {
    console.log('exception: ', e)
    return null
  }
}
