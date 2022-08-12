import { FastifyInstance } from 'fastify'
import S from 'fluent-json-schema'
import { BillingInfoSchema } from '@httpmon/db'
import {
  Params,
  ParamsSchema,
  PaymentCardSchema,
  AddPaymentMethod,
  AddPaymentMethodSchema,
  CreatePrepaidPlan,
  CreatePrepaidPlanSchema,
} from '../../types'
import { onRequestAuthHook } from '../RouterHooks'
import { BillingService } from '../../services/BillingService'

export default async function BillingRouter(app: FastifyInstance) {
  app.addHook('onRequest', onRequestAuthHook)

  const billingService = BillingService.getInstance()

  app.post<{ Body: AddPaymentMethod }>(
    '/payment-methods',
    {
      schema: {
        body: AddPaymentMethodSchema,
        response: {
          200: PaymentCardSchema,
        },
      },
    },
    async function ({ body: { paymentMethodId }, log }, reply) {
      const resp = await billingService.addPaymentMethod(paymentMethodId)
      log.info(`Add payment method: ${JSON.stringify(resp?.id)}`)
      reply.send(resp)
    }
  )

  // GET /
  app.get(
    '/payment-methods',
    {
      schema: {
        response: {
          200: S.array().items(PaymentCardSchema),
        },
      },
    },
    async function (req, reply) {
      const resp = await billingService.listPaymentMethods()
      req.log.info(`Get settings: ${JSON.stringify(resp)}`)
      reply.send(resp)
    }
  )

  app.put<{ Params: Params }>(
    '/payment-methods/:id',
    {
      schema: {
        params: ParamsSchema,
      },
    },
    async function ({ params: { id }, log }, reply) {
      const resp = await billingService.updatePaymentMethod(id)
      log.info(`Change default payment method ${resp}`)
      reply.send(resp)
    }
  )

  app.delete<{ Params: Params }>(
    '/payment-methods/:id',
    {
      schema: {
        params: ParamsSchema,
      },
    },
    async function ({ params: { id }, log }, reply) {
      const resp = await billingService.deletePaymentMethod(id)
      log.info(`Remove payment method ${id}`)
      reply.send(resp)
    }
  )

  // GET /
  app.get(
    '/my-plan',
    {
      schema: {
        response: {
          200: BillingInfoSchema,
        },
      },
    },
    async function (req, reply) {
      const resp = await billingService.getCurrentPlan()
      req.log.info(`Get current plan: ${JSON.stringify(resp)}`)
      reply.send(resp)
    }
  )

  app.post<{ Body: CreatePrepaidPlan }>(
    '/new-prepaid-plan',
    {
      schema: {
        body: CreatePrepaidPlanSchema,
      },
    },
    async function ({ body: { amount, plan, billing_start, limit }, log }, reply) {
      const resp = await billingService.upgradeToPrepaidPlan(amount, limit, plan, billing_start)
      log.info(`Upgrade to Prepaid plan: ${JSON.stringify(resp)}`)
      reply.send(resp)
    }
  )

  app.post('/pay-as-you-go-plan', {}, async function ({ log }, reply) {
    const resp = await billingService.upgradeToPayAsYouGoPlan()
    log.info(`Upgrade to Pay As You Go plan: ${JSON.stringify(resp)}`)
    reply.send(resp)
  })

  app.post('/free-plan', {}, async function ({ log }, reply) {
    const resp = await billingService.downgradeToFreePlan()
    log.info(`Downgrade to free plan: ${JSON.stringify(resp)}`)
    reply.send(resp)
  })
}
