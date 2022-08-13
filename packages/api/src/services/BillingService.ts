import { currentUserInfo } from '../Context'
import Stripe from 'stripe'
import { logger } from '../Context'

import { db } from '@httpmon/db'
import {
  addPaymentCard,
  getPaymentCards,
  removePaymentCard,
  updateDefaultPaymentCard,
  getCutomerDetails,
  createPrepaidSubscription,
  deleteSubscriptions,
} from './StripeService'

export class BillingService {
  static instance: BillingService

  public static getInstance(): BillingService {
    if (!BillingService.instance) {
      BillingService.instance = new BillingService()
    }
    return BillingService.instance
  }

  public async listPaymentMethods() {
    const userAccount = await db
      .selectFrom('UserAccount')
      .select('stripeCustomerId')
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
    if (userAccount?.stripeCustomerId) {
      const { data } = await getPaymentCards(userAccount.stripeCustomerId)
      return data
    }
    return []
  }

  public async deletePaymentMethod(paymentMethodId: string) {
    const data = await removePaymentCard(paymentMethodId)
    return data
  }

  public async addPaymentMethod(paymentMethodId: string) {
    const userAccount = await db
      .selectFrom('UserAccount')
      .select('stripeCustomerId')
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
    if (userAccount?.stripeCustomerId) {
      const data = await addPaymentCard(userAccount.stripeCustomerId, paymentMethodId)
      return data
    }
    return
  }

  public async updatePaymentMethod(paymentMethodId: string) {
    const userAccount = await db
      .selectFrom('UserAccount')
      .select('stripeCustomerId')
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
    if (userAccount?.stripeCustomerId) {
      const data = await updateDefaultPaymentCard(userAccount.stripeCustomerId, paymentMethodId)
      return data
    }
    return false
  }

  public async getCurrentPlan() {
    const billingInfo = await db
      .selectFrom('BillingInfo')
      .selectAll()
      .where('accountId', '=', currentUserInfo().accountId)
      .orderBy('createdAt', 'desc')
      .executeTakeFirst()
    const userAccount = await db
      .selectFrom('UserAccount')
      .select('stripeCustomerId')
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
    if (userAccount?.stripeCustomerId) {
      const data = await getCutomerDetails(userAccount.stripeCustomerId)
      return {
        ...billingInfo,
        defaultPaymentMethod: data,
      }
    }
    return {
      ...billingInfo,
      defaultPaymentMethod: null,
    }
  }

  public async upgradeToPrepaidPlan(
    amount: number,
    limit: number,
    plan: Stripe.PriceCreateParams.Recurring.Interval,
    billingStart: number
  ) {
    const userAccount = await db
      .selectFrom('UserAccount')
      .select('stripeCustomerId')
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
    if (userAccount?.stripeCustomerId) {
      try {
        await deleteSubscriptions(userAccount?.stripeCustomerId)
        await createPrepaidSubscription(userAccount.stripeCustomerId, amount, plan, billingStart)
        const billingInfo = await db
          .updateTable('BillingInfo')
          .set({
            billingPlanType: `prepaid_${plan}`,
            monitorRunsLimit: limit,
            createdAt: new Date(),
          })
          .where('accountId', '=', currentUserInfo().accountId)
          .executeTakeFirst()
        return billingInfo
      } catch (error) {
        logger.error(error, 'stripe payment')
        throw error
      }
    }
    return
  }

  public async upgradeToPayAsYouGoPlan() {
    const userAccount = await db
      .selectFrom('UserAccount')
      .select('stripeCustomerId')
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
    if (userAccount?.stripeCustomerId) {
      try {
        await deleteSubscriptions(userAccount?.stripeCustomerId)
        const billingInfo = await db
          .updateTable('BillingInfo')
          .set({
            billingPlanType: 'pay-as-you-go',
            monitorRunsLimit: null,
            createdAt: new Date(),
          })
          .where('accountId', '=', currentUserInfo().accountId)
          .executeTakeFirst()
        return billingInfo
      } catch (error) {
        logger.error(error, 'stripe payment')
        throw error
      }
    }
    return
  }

  public async downgradeToFreePlan() {
    const userAccount = await db
      .selectFrom('UserAccount')
      .select('stripeCustomerId')
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
    if (userAccount?.stripeCustomerId) {
      try {
        await deleteSubscriptions(userAccount?.stripeCustomerId)
        const billingInfo = await db
          .updateTable('BillingInfo')
          .set({ billingPlanType: 'free', monitorRunsLimit: 50000, createdAt: new Date() })
          .where('accountId', '=', currentUserInfo().accountId)
          .executeTakeFirst()
        return billingInfo
      } catch (error) {
        logger.error(error, 'stripe payment')
        throw error
      }
    }
    return
  }
}
