import { FormEvent, useState } from 'react'
import { PaymentMethodResult, StripeCardElement } from '@stripe/stripe-js'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import {
  Box,
  Grid,
  Flex,
  Image,
  Stack,
  Button,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
  Radio,
  RadioGroup,
} from '@chakra-ui/react'
import { useQuery } from 'react-query'
import axios from 'axios'
import { FiTrash2 } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

import { Section, Text, SettingsHeader, PrimaryButton } from '../components'
import { PaymentCard } from '../types/common'
import { AmericanExpress, MasterCard, Visa } from '../Assets'

import { Store } from '../services/Store'
import { BillingInfo } from '@httpmon/db'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js/pure'
loadStripe.setLoadParameters({ advancedFraudSignals: false })

interface Props {
  billingInfo?: BillingInfo
}

function CurrentPlan({ billingInfo }: Props) {
  const navigate = useNavigate()

  const simplify = (value: number | null) => {
    if (!value) return 0
    if (value > 1000000) {
      return value / 1000000 + 'M'
    } else if (value > 1000) {
      return value / 1000 + 'K'
    }
    return value
  }

  return (
    <Section display='flex' flexDirection='column' boxShadow='0 0 2px 2px rgba(0,0,0,0.05)'>
      <Text variant='text-field' color='darkgray.100'>
        Current Plan
      </Text>
      <Flex alignItems='center' flex='1' wrap='wrap' gap='8' mt='4' mb='2'>
        {billingInfo?.billingPlanType === 'free' && (
          <>
            <Flex direction='column'>
              <Text variant='details' mb='1' color='gray.300'>
                Plan
              </Text>
              <Text variant='text-field' color='darkgray.100'>
                Free
              </Text>
            </Flex>
            <Flex direction='column'>
              <Text variant='details' mb='1' color='gray.300'>
                Refreshed on
              </Text>
              <Text variant='text-field' color='darkgray.100'>
                {dayjs(billingInfo.createdAt).add(1, 'month').format('MMM DD, YYYY')}
              </Text>
            </Flex>
            <Flex direction='column'>
              <Text variant='details' mb='1' color='gray.300'>
                Monitor Runs Limit
              </Text>
              <Text variant='text-field' color='darkgray.100'>
                {simplify(billingInfo.monitorRunsLimit)} / month
              </Text>
            </Flex>
          </>
        )}
        {billingInfo?.billingPlanType === 'pay-as-you-go' && (
          <>
            <Flex direction='column'>
              <Text variant='details' mb='1' color='gray.300'>
                Plan
              </Text>
              <Text variant='text-field' color='darkgray.100'>
                Pay as you go
              </Text>
            </Flex>
            <Flex direction='column'>
              <Text variant='details' mb='1' color='gray.300'>
                Refreshed on
              </Text>
              <Text variant='text-field' color='darkgray.100'>
                {dayjs(billingInfo.createdAt).add(1, 'month').format('MMM DD, YYYY')}
              </Text>
            </Flex>
            <Flex direction='column'>
              <Text variant='details' mb='1' color='gray.300'>
                Monitor Runs Limit
              </Text>
              <Text variant='text-field' color='darkgray.100'>
                No limit
              </Text>
            </Flex>
          </>
        )}
        {billingInfo?.billingPlanType === 'prepaid_month' && (
          <>
            <Flex direction='column'>
              <Text variant='details' mb='1' color='gray.300'>
                Plan
              </Text>
              <Text variant='text-field' color='darkgray.100'>
                Prepaid Monthly
              </Text>
            </Flex>
            <Flex direction='column'>
              <Text variant='details' mb='1' color='gray.300'>
                Refreshed on
              </Text>
              <Text variant='text-field' color='darkgray.100'>
                {dayjs(billingInfo.createdAt).add(1, 'month').format('MMM DD, YYYY')}
              </Text>
            </Flex>
            <Flex direction='column'>
              <Text variant='details' mb='1' color='gray.300'>
                Monitor Runs Limit
              </Text>
              <Text variant='text-field' color='darkgray.100'>
                {simplify(billingInfo?.monitorRunsLimit)} / month
              </Text>
            </Flex>
          </>
        )}
        {billingInfo?.billingPlanType === 'prepaid_year' && (
          <>
            <Flex direction='column'>
              <Text variant='details' mb='1' color='gray.300'>
                Plan
              </Text>
              <Text variant='text-field' color='darkgray.100'>
                Prepaid Yearly
              </Text>
            </Flex>
            <Flex direction='column'>
              <Text variant='details' mb='1' color='gray.300'>
                Refreshed on
              </Text>
              <Text variant='text-field' color='darkgray.100'>
                {dayjs(billingInfo.createdAt).add(1, 'year').format('MMM DD, YYYY')}
              </Text>
            </Flex>
            <Flex direction='column'>
              <Text variant='details' mb='1' color='gray.300'>
                Monitor Runs Limit
              </Text>
              <Text variant='text-field' color='darkgray.100'>
                {simplify(billingInfo?.monitorRunsLimit)} / month
              </Text>
            </Flex>
          </>
        )}
      </Flex>
      <Box mt={6} mb={2}>
        <PrimaryButton
          label='Switch'
          variant='emphasis'
          color={'white'}
          onClick={() => navigate('/console/settings/billing/plans')}
        ></PrimaryButton>
      </Box>
    </Section>
  )
}

function PaymentCards({ billingInfo }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const toast = useToast()

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [showAddCardModal, setShowAddCardModal] = useState<boolean>(false)
  const [activePaymentMethod, setActivePaymentMethod] = useState<string | undefined>()

  const { data: paymentMethods } = useQuery<PaymentCard[]>(['payment-methods'], async () => {
    const resp = await axios({
      method: 'GET',
      url: '/billing/payment-methods',
    })
    return resp.data
  })

  const addPaymentCard = async (event: FormEvent) => {
    event.preventDefault()

    if (stripe && elements) {
      const { paymentMethod }: PaymentMethodResult = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement) as StripeCardElement,
      })
      // add payment method to current customer
      await axios({
        method: 'POST',
        url: '/billing/payment-methods',
        data: {
          paymentMethodId: paymentMethod?.id,
        },
      })
      Store.queryClient?.invalidateQueries(['payment-methods'])
    } else {
      toast({
        position: 'top',
        title: 'Stripe Error',
        description: "Stripe elements don't load properly.",
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    }
    setShowAddCardModal(false)
  }

  const getImage = (type: string) => {
    switch (type) {
      case 'visa':
        return Visa
      case 'mastercard':
        return MasterCard
      case 'amex':
        return AmericanExpress
      default:
    }
    return ''
  }

  const onModalClose = () => {
    setShowDeleteModal(false)
    setShowAddCardModal(false)
  }

  const openDeleteModal = (id: string) => {
    setActivePaymentMethod(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    await axios({
      method: 'DELETE',
      url: `/billing/payment-methods/${activePaymentMethod}`,
    })
    setShowDeleteModal(false)
    Store.queryClient?.invalidateQueries(['payment-methods'])
  }

  const changeDefaultPaymentMethod = async (paymentMethodId: string) => {
    await axios({
      method: 'PUT',
      url: `/billing/payment-methods/${paymentMethodId}`,
    })
    Store.queryClient?.invalidateQueries(['current-plan'])
  }

  return (
    <Section boxShadow='0 0 2px 2px rgba(0,0,0,0.05)'>
      <Text variant='text-field' color='darkgray.100'>
        Payment Methods
      </Text>
      <Box my={4}>
        {paymentMethods && paymentMethods.length > 0 ? (
          <RadioGroup
            mt={2}
            mb={4}
            value={billingInfo?.defaultPaymentMethod}
            onChange={changeDefaultPaymentMethod}
          >
            <Stack direction='column' gap={2}>
              {paymentMethods?.map((method) => (
                <Flex
                  key={method.id}
                  html-for={`payment-method-${method.id}`}
                  alignItems='center'
                  gap={2}
                  py='1'
                  px='2'
                  borderRadius='8'
                  border='1px solid'
                  borderColor='lightgray.100'
                >
                  <Radio
                    id={`payment-method-${method.id}`}
                    value={method.id}
                    colorScheme='cyan'
                    _focus={{ boxShadow: 'none' }}
                  ></Radio>
                  <Image src={getImage(method.card.brand)} h='5' w='8' />
                  <Text flex='1' variant='details' color='gray.300'>
                    xxxx xxxx xxxx {method.card.last4}
                  </Text>
                  <Text variant='details' color='gray.300'>
                    Exp:{' '}
                    {method.card.exp_month < 10
                      ? `0${method.card.exp_month}`
                      : method.card.exp_month}
                    /{method.card.exp_year}
                  </Text>
                  <Button
                    w={6}
                    h={6}
                    minW={6}
                    borderRadius='4'
                    bg='lightgray.100'
                    p='0'
                    onClick={() => openDeleteModal(method.id)}
                  >
                    <Icon color='red.200' fontSize={'xs'} as={FiTrash2} cursor='pointer' />
                  </Button>
                </Flex>
              ))}
            </Stack>
          </RadioGroup>
        ) : (
          <Box py='4' textAlign='center'>
            <Text variant='paragraph' color='gray.300'>
              No Cards
            </Text>
          </Box>
        )}
      </Box>
      <Box textAlign='center' mb={2}>
        <PrimaryButton
          label='Add card'
          variant='emphasis'
          color={'white'}
          w='48'
          onClick={() => setShowAddCardModal(true)}
        ></PrimaryButton>
      </Box>
      <Modal isOpen={showDeleteModal} onClose={onModalClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius={16} boxShadow='0px 4px 16px rgba(38, 50, 56, 0.1)'>
          <ModalHeader pb={2}>
            <Text color='black' variant='header'>
              Delete payment card?
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text variant='paragraph' color='gray.300'>
              All related information will be lost, this action is permanent, and cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <PrimaryButton
              label='Delete'
              variant='emphasis'
              color='white'
              mr={3}
              onClick={confirmDelete}
            ></PrimaryButton>
            <Button
              variant='outline'
              borderRadius={24}
              border='2px'
              px='22px'
              color='darkblue.100'
              borderColor='darkblue.100'
              _hover={{ bg: 'transparent' }}
              onClick={onModalClose}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={showAddCardModal} onClose={onModalClose} isCentered>
        <ModalOverlay />
        <form onSubmit={addPaymentCard}>
          <ModalContent borderRadius={16} boxShadow='0px 4px 16px rgba(38, 50, 56, 0.1)'>
            <ModalHeader pb={2}>
              <Text color='black' variant='header'>
                Add Payment Card
              </Text>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody mx={6} my={4} p={2} border='1px solid' borderColor='gray.200'>
              <CardElement />
            </ModalBody>
            <ModalFooter>
              <Button
                variant='outline'
                borderRadius={24}
                border='2px'
                px='22px'
                color='darkblue.100'
                borderColor='darkblue.100'
                type='reset'
                _hover={{ bg: 'transparent' }}
                onClick={onModalClose}
                mr={3}
              >
                Cancel
              </Button>
              <PrimaryButton
                label='Add'
                variant='emphasis'
                color='white'
                disabled={!stripe || !elements}
                type='submit'
              ></PrimaryButton>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </Section>
  )
}

export default function SettingsBilling() {
  const { data: billingInfo } = useQuery<BillingInfo>(['current-plan'], async () => {
    const resp = await axios({
      method: 'GET',
      url: '/billing/my-plan',
    })
    return resp.data
  })

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string)

  return (
    <Elements stripe={stripePromise}>
      <SettingsHeader title='Billing & Usage'></SettingsHeader>
      <Box width='100%'>
        <Section pt={4} pb={10}>
          <Box>
            <Text variant='title' color='black'>
              Billing & Usage
            </Text>
          </Box>
          <Box>
            <Text variant='paragraph' color='gray.300'>
              Manage your plan and update credit card
            </Text>
          </Box>
          <Grid my={6} templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap={6}>
            <CurrentPlan billingInfo={billingInfo}></CurrentPlan>
            <PaymentCards billingInfo={billingInfo}></PaymentCards>
          </Grid>
        </Section>
      </Box>
    </Elements>
  )
}
