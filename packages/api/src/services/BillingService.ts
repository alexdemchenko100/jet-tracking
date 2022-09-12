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
  createStripeCustomer,
} from './StripeService'

async function getStripeCustomerId() {
  const account = await db
    .selectFrom('Account')
    .selectAll()
    .where('id', '=', currentUserInfo().accountId)
    .executeTakeFirst()

  if (account && account.id && !account?.stripeCustomerId) {
    //try to create one here
    // create new stripe customer
    const customer = await createStripeCustomer(account.id, account.owner)
    if (customer) {
      await db
        .updateTable('Account')
        .set({ stripeCustomerId: customer.id })
        .where('id', '=', currentUserInfo().accountId)
        .executeTakeFirst()
      return customer.id
    }
  }

  return account?.stripeCustomerId
}

export class BillingService {
  static instance: BillingService

  public static getInstance(): BillingService {
    if (!BillingService.instance) {
      BillingService.instance = new BillingService()
    }
    return BillingService.instance
  }

  public async listPaymentMethods() {
    const stripeCustomerId = await getStripeCustomerId()
    if (stripeCustomerId) {
      const { data } = await getPaymentCards(stripeCustomerId)
      return data
    }
    return []
  }

  public async deletePaymentMethod(paymentMethodId: string) {
    const data = await removePaymentCard(paymentMethodId)
    return data
  }

  public async addPaymentMethod(paymentMethodId: string) {
    const stripeCustomerId = await getStripeCustomerId()
    if (stripeCustomerId) {
      const data = await addPaymentCard(stripeCustomerId, paymentMethodId)
      return data
    }
    return
  }

  public async updatePaymentMethod(paymentMethodId: string) {
    const stripeCustomerId = await getStripeCustomerId()
    if (stripeCustomerId) {
      const data = await updateDefaultPaymentCard(stripeCustomerId, paymentMethodId)
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

    const stripeCustomerId = await getStripeCustomerId()
    if (stripeCustomerId) {
      const data = await getCutomerDetails(stripeCustomerId)
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
    const stripeCustomerId = await getStripeCustomerId()
    if (stripeCustomerId) {
      try {
        await deleteSubscriptions(stripeCustomerId)
        await createPrepaidSubscription(stripeCustomerId, amount, plan, billingStart)
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
    const stripeCustomerId = await getStripeCustomerId()
    if (stripeCustomerId) {
      try {
        await deleteSubscriptions(stripeCustomerId)
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
    const stripeCustomerId = await getStripeCustomerId()
    if (stripeCustomerId) {
      try {
        await deleteSubscriptions(stripeCustomerId)
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
