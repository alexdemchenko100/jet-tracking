import { db, MonitorResultTable } from '@httpmon/db'
import { Insertable } from 'kysely'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import { logger } from '../Context'
import { createStripeCustomer, payAsYouGoPlan } from '../services/StripeService'
import { nanoid } from 'nanoid'
import { createBucket, uploadObject } from './GSCService'

export const getCurrentAccountIdByUser = async (userId: string) => {
  const resp = await db
    .selectFrom('UserAccount')
    .selectAll()
    .where('userId', '=', userId)
    .where('isCurrentAccount', '=', true)
    .executeTakeFirst()

  return resp?.accountId
}

export const getRoleFromAccountId = async (accountId: string, userId: string) => {
  const resp = await db
    .selectFrom('UserAccount')
    .select(['role'])
    .where('accountId', '=', accountId)
    .where('userId', '=', userId)
    .executeTakeFirst()

  return resp?.role
}

export const processInvitedAccounts = async (userId: string, email: string) => {
  const userAccounts = await db
    .selectFrom('UserAccount')
    .selectAll()
    .where('email', '=', email)
    .execute()

  userAccounts.map(async (acct) => {
    if (!acct.userId) {
      await db
        .updateTable('UserAccount')
        .set({ ...acct, userId })
        .returningAll()
        .executeTakeFirst()
    }
  })
}

export const createNewAccount = async (userId: string, email: string) => {
  let newAccountId = ''

  await db.transaction().execute(async (trx) => {
    //create account
    // create new stripe customer
    const customer = await createStripeCustomer(userId, email)

    const account = await trx
      .insertInto('Account')
      .values({ id: uuidv4(), name: userId, stripeCustomerId: customer.id })
      .returningAll()
      .executeTakeFirst()

    if (!account || !account.id) {
      throw new Error('not able to create account')
    }

    // create GCS bucket
    createBucket(account.id).catch((err) => {
      throw err
    })

    const userAccount = await trx
      .insertInto('UserAccount')
      .values({
        id: uuidv4(),
        userId: userId,
        email: email,
        accountId: account.id,
        isCurrentAccount: true,
        role: 'owner',
        isVerified: true,
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
        monitorRunsLimit: 50000,
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
    return await db.transaction().execute(async (trx) => {
      const { count } = db.fn
      const monitorResult = await trx
        .insertInto('MonitorResult')
        .values({
          ...resultForSaving,
          id: uuidv4(),
          body: '',
        })
        .returningAll()
        .executeTakeFirst()

      if (!monitorResult?.id) throw new Error()
      // Saving body to cloud storage
      const { body } = resultForSaving
      uploadObject(result.accountId, monitorResult.id, 'body', body)

      const billingInfo = await trx
        .selectFrom('BillingInfo')
        .selectAll()
        .where('accountId', '=', result.accountId)
        .executeTakeFirst()
      if (
        billingInfo?.billingPlanType === 'pay-as-you-go' &&
        dayjs(billingInfo?.createdAt).add(1, 'month').format('YYYY-MM-DD') ===
          dayjs().format('YYYY-MM-DD')
      ) {
        const total = await trx
          .selectFrom('MonitorResult')
          .select(count<number>('id').as('count'))
          .where('accountId', '=', result.accountId)
          .execute()
        const amount = parseInt(((total[0].count / 100000) * 200).toString())
        const account = await trx
          .selectFrom('Account')
          .select('stripeCustomerId')
          .where('id', '=', result.accountId)
          .executeTakeFirst()
        if (account?.stripeCustomerId) {
          const invoice = await payAsYouGoPlan(account?.stripeCustomerId, amount)
          if (invoice) {
            await trx
              .updateTable('BillingInfo')
              .set({
                createdAt: new Date(),
              })
              .where('accountId', '=', result.accountId)
              .executeTakeFirst()
          }
        }
      }
      return monitorResult
    })
  } catch (e) {
    logger.error(e, 'exception in saving monitor result')
    return null
  }
}
