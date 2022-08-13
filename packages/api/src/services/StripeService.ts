import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-08-01',
})

export const createStripeCustomer = async (uid: string, email: string) => {
  const params: Stripe.CustomerCreateParams = {
    description: uid,
    email,
  }

  const customer: Stripe.Customer = await stripe.customers.create(params)

  return customer
}

export const getPaymentCards = async (customerId: string) => {
  const paymentMethods = await stripe.customers.listPaymentMethods(customerId, {
    type: 'card',
  })

  return paymentMethods
}

export const removePaymentCard = async (paymentMethodId: string) => {
  const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId)

  return paymentMethod
}

export const addPaymentCard = async (customerId: string, paymentMethodId: string) => {
  const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  })
  return paymentMethod
}

export const updateDefaultPaymentCard = async (customerId: string, paymentMethodId: string) => {
  const res = await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  })

  return res
}

export const getCutomerDetails = async (customerId: string) => {
  const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer
  return customer.invoice_settings.default_payment_method || customer.default_source
}

export const createPrepaidSubscription = async (
  customerId: string,
  amount: number,
  plan: Stripe.PriceCreateParams.Recurring.Interval,
  billingStart: number
) => {
  const product = await stripe.products.create({
    name: `Prepaid-${plan}-${customerId}`,
  })
  const price = await stripe.prices.create({
    unit_amount: amount,
    currency: 'usd',
    recurring: { interval: plan },
    product: product.id,
  })

  const data = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: price.id }],
    billing_cycle_anchor: billingStart,
  })
  return data
}

export const deleteSubscriptions = async (customerId: string) => {
  const { data: subscriptions } = await stripe.subscriptions.list({
    customer: customerId,
  })

  const promises: any[] = []
  subscriptions.forEach((subscription: Stripe.Subscription) => {
    promises.push(stripe.subscriptions.del(subscription.id, { prorate: true }))
  })
  await Promise.all(promises)
}

export const payAsYouGoPlan = async (customerId: string, amount: number) => {
  const product = await stripe.products.create({
    name: `PayAsYouGo-${customerId}`,
  })
  const price = await stripe.prices.create({
    unit_amount: amount,
    currency: 'usd',
    product: product.id,
  })
  const invoice = await stripe.invoices.create({
    customer: customerId,
  })
  if (invoice.id) {
    await stripe.invoiceItems.create({
      customer: customerId,
      price: price.id,
      invoice: invoice.id,
    })
    await stripe.invoices.finalizeInvoice(invoice.id)
    const result = await stripe.invoices.pay(invoice.id)
    return result
  }
  return null
}
