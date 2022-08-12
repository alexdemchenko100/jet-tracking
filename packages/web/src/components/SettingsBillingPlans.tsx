import { Badge, Box, Divider, Flex, Grid, Icon, useToast } from '@chakra-ui/react'
import { BillingInfo } from '@httpmon/db'
import axios from 'axios'
import { FiCheck } from 'react-icons/fi'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { PrimaryButton, Section, SettingsHeader, Text } from '../components'

interface PlanProps {
  isActive: boolean
}

function FreePlan({ isActive }: PlanProps) {
  const navigate = useNavigate()
  const toast = useToast()

  const startPlan = async () => {
    const resp = await axios({
      method: 'POST',
      url: '/billing/free-plan',
    })
    if (resp?.status === 200) {
      toast({
        position: 'top',
        description: `Your billing plan has been upgraded to Pay As You Go plan`,
        status: 'info',
        duration: 2000,
        isClosable: false,
      })
      navigate('/console/settings/billing')
    }
  }

  return (
    <Section display='flex' flexDirection='column' boxShadow='0 0 2px 2px rgba(0,0,0,0.05)'>
      <Box textAlign='right'>
        <Badge variant='solid' colorScheme='green'>
          {isActive ? 'Current Plan' : ''}
        </Badge>
      </Box>
      <Flex direction='column' pb={2}>
        <Text variant='header' color='black'>
          Free
        </Text>
        <Text variant='paragraph' color='gray.300' mt={1}>
          Use limited checks
        </Text>
      </Flex>
      <Flex flex={1} my={4} gap={6}>
        <Flex direction='column'>
          <Text variant='details' mb='1' color='gray.300'>
            Monitor Runs Limit
          </Text>
          <Text variant='text-field' color='darkgray.100'>
            5K / month
          </Text>
        </Flex>
      </Flex>
      <Box mt={6} mb={2} textAlign='center'>
        <PrimaryButton
          disabled={isActive}
          label='Upgrade plan'
          variant='emphasis'
          color={'white'}
          onClick={startPlan}
        ></PrimaryButton>
      </Box>
    </Section>
  )
}

function PayAsGoPlan({ isActive }: PlanProps) {
  const navigate = useNavigate()

  return (
    <Section display='flex' flexDirection='column' boxShadow='0 0 2px 2px rgba(0,0,0,0.05)'>
      <Box textAlign='right'>
        <Badge variant='solid' colorScheme='green'>
          {isActive ? 'Current Plan' : ''}
        </Badge>
      </Box>
      <Flex direction='column' pb={2}>
        <Text variant='header' color='black'>
          Pay as you go
        </Text>
        <Text variant='paragraph' color='gray.300' mt={1}>
          Pay only for what you use
        </Text>
      </Flex>
      <Flex my={4} gap={4}>
        <Flex direction='column'>
          <Text variant='title' color='darkgray.100'>
            $2.50
          </Text>
          <Text variant='details' mb='1' color='gray.300'>
            for 10k Monitor Check runs
          </Text>
        </Flex>
      </Flex>
      <Divider></Divider>
      <Box flex='1' pt='4'>
        <Flex mb='4' gap={2} alignItems='start'>
          <Flex
            alignItems='center'
            p='0.5'
            justifyContent='center'
            borderRadius='50%'
            bg='cyan.500'
          >
            <Icon fontSize='sm' as={FiCheck} color='white' />
          </Flex>
          <Text variant='paragraph' color='gray.300'>
            All features & as many checks and users as you need
          </Text>
        </Flex>
        <Flex mb='4' gap={2} alignItems='start'>
          <Flex
            alignItems='center'
            p='0.5'
            justifyContent='center'
            borderRadius='50%'
            bg='cyan.500'
          >
            <Icon fontSize='sm' as={FiCheck} color='white' />
          </Flex>
          <Text variant='paragraph' color='gray.300'>
            Pay for the exact amount of check runs you use / month
          </Text>
        </Flex>
        <Flex mb='4' gap={2} alignItems='start'>
          <Flex
            alignItems='center'
            p='0.5'
            justifyContent='center'
            borderRadius='50%'
            bg='cyan.500'
          >
            <Icon fontSize='sm' as={FiCheck} color='white' />
          </Flex>
          <Text variant='paragraph' color='gray.300'>
            No upfront payment required
          </Text>
        </Flex>
        <Flex mb='4' gap={2} alignItems='start'>
          <Flex
            alignItems='center'
            p='0.5'
            justifyContent='center'
            borderRadius='50%'
            bg='cyan.500'
          >
            <Icon fontSize='sm' as={FiCheck} color='white' />
          </Flex>
          <Text variant='paragraph' color='gray.300'>
            30 days data retention
          </Text>
        </Flex>
      </Box>
      <Box mt={6} mb={2} textAlign='center'>
        <PrimaryButton
          disabled={isActive}
          label='Upgrade plan'
          variant='emphasis'
          color={'white'}
          onClick={() => navigate('/console/settings/billing/pay-as-you-go')}
        ></PrimaryButton>
      </Box>
    </Section>
  )
}

function PrePaidPlan({ isActive }: PlanProps) {
  const navigate = useNavigate()

  return (
    <Section display='flex' flexDirection='column' boxShadow='0 0 2px 2px rgba(0,0,0,0.05)'>
      <Box textAlign='right'>
        <Badge variant='solid' colorScheme='green'>
          {isActive ? 'Current Plan' : ''}
        </Badge>
      </Box>
      <Flex direction='column' pb={2}>
        <Text variant='header' color='black'>
          Prepaid
        </Text>
        <Text variant='paragraph' color='gray.300' mt={1}>
          Pay upfront, get lower prices.
        </Text>
      </Flex>
      <Flex my={4} gap={4}>
        <Flex direction='column'>
          <Text variant='title' color='darkgray.100'>
            $2.0
          </Text>
          <Text variant='details' mb='1' color='gray.300'>
            for 10k Monitor Check runs
          </Text>
        </Flex>
      </Flex>
      <Divider></Divider>
      <Box flex={1} pt='4'>
        <Flex mb='4' gap={2} alignItems='start'>
          <Flex
            alignItems='center'
            p='0.5'
            justifyContent='center'
            borderRadius='50%'
            bg='cyan.500'
          >
            <Icon fontSize='sm' as={FiCheck} color='white' />
          </Flex>
          <Text variant='paragraph' color='gray.300'>
            All features & as many checks and users as you need
          </Text>
        </Flex>
        <Flex mb='4' gap={2} alignItems='start'>
          <Flex
            alignItems='center'
            p='0.5'
            justifyContent='center'
            borderRadius='50%'
            bg='cyan.500'
          >
            <Icon fontSize='sm' as={FiCheck} color='white' />
          </Flex>
          <Text variant='paragraph' color='gray.300'>
            Pay upfront, get an up to 33% lower price
          </Text>
        </Flex>
        <Flex mb='4' gap={2} alignItems='start'>
          <Flex
            alignItems='center'
            p='0.5'
            justifyContent='center'
            borderRadius='50%'
            bg='cyan.500'
          >
            <Icon fontSize='sm' as={FiCheck} color='white' />
          </Flex>
          <Text variant='paragraph' color='gray.300'>
            Any overages are priced at the "Pay as you Go" price
          </Text>
        </Flex>
        <Flex mb='4' gap={2} alignItems='start'>
          <Flex
            alignItems='center'
            p='0.5'
            justifyContent='center'
            borderRadius='50%'
            bg='cyan.500'
          >
            <Icon fontSize='sm' as={FiCheck} color='white' />
          </Flex>
          <Text variant='paragraph' color='gray.300'>
            30 days data retention
          </Text>
        </Flex>
      </Box>
      <Box mt={6} mb={2} textAlign='center'>
        <PrimaryButton
          disabled={isActive}
          label='Upgrade plan'
          variant='emphasis'
          color={'white'}
          onClick={() => navigate('/console/settings/billing/prepaid')}
        ></PrimaryButton>
      </Box>
    </Section>
  )
}

export default function SettingsBillingPlans() {
  const { data: billingInfo } = useQuery<BillingInfo>(['current-plan'], async () => {
    const resp = await axios({
      method: 'GET',
      url: '/billing/my-plan',
    })
    return resp.data
  })

  return (
    <>
      <SettingsHeader formChanged={false} resetForm={() => {}}></SettingsHeader>
      <Box width='100%'>
        <Section pt={4} pb={10}>
          <Box>
            <Text variant='title' color='black'>
              Billing Plans
            </Text>
          </Box>
          <Grid my={6} templateColumns={{ base: '1fr', xl: '1fr 1fr 1fr' }} gap={6}>
            <FreePlan isActive={billingInfo?.billingPlanType === 'free'}></FreePlan>
            <PayAsGoPlan isActive={billingInfo?.billingPlanType === 'pay-as-you-go'}></PayAsGoPlan>
            <PrePaidPlan
              isActive={billingInfo?.billingPlanType.includes('prepaid') || false}
            ></PrePaidPlan>
          </Grid>
        </Section>
      </Box>
    </>
  )
}
