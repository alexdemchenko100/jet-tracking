import {
  Box,
  Flex,
  Divider,
  Icon,
  Grid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  toast,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import axios from 'axios'
import dayjs from 'dayjs'
import { useState } from 'react'
import { FiAlertCircle } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { PrimaryButton, Section, SettingsHeader, Text, MonitorTab } from '../components'

interface PlanSelectorProps {
  planChanged: (_: string) => void
  limitChanged: (_: number) => void
}

function PlanSelector({ planChanged, limitChanged }: PlanSelectorProps) {
  const [monthlyLimit, setMonthlyLimit] = useState<number>(100000)
  const [yearlyLimit, setYearlyLimit] = useState<number>(100000)

  const onYearlyLimitChange = (_: string, value: number) => {
    setYearlyLimit(value)
    limitChanged(value)
  }

  const onMonthlyLimitChange = (_: string, value: number) => {
    setMonthlyLimit(value)
    limitChanged(value)
  }

  const onTabChange = (index: number) => {
    if (index === 0) {
      planChanged('month')
      limitChanged(monthlyLimit)
    } else {
      planChanged('year')
      limitChanged(yearlyLimit)
    }
  }

  return (
    <Flex
      p='24'
      height='max-content'
      justifyContent='center'
      borderRadius={8}
      border='1px solid'
      borderColor='gray.300'
    >
      <Tabs textAlign='center' onChange={onTabChange}>
        <TabList display='inline-flex'>
          <MonitorTab>MONTHLY</MonitorTab>
          <MonitorTab>ANNUAL</MonitorTab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box textAlign='left'>
              <Text variant='paragraph' color='darkgray.100'>
                API check runs / month
              </Text>
              <NumberInput value={monthlyLimit} step={10000} onChange={onMonthlyLimitChange}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
          </TabPanel>
          <TabPanel>
            <Box textAlign='left'>
              <Text variant='paragraph' color='darkgray.100'>
                API check runs / month
              </Text>
              <NumberInput value={yearlyLimit} step={10000} onChange={onYearlyLimitChange}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text variant='small' color='gray.400'>
                This amounts to 100K x 12 = 1.2M per year
              </Text>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  )
}

export default function SettingsBillingPrepaid() {
  const [currentPlan, setCurrentPlan] = useState<string>('month')
  const [limit, setLimit] = useState<number>(100000)
  const [loading, setLoading] = useState<boolean>(false)
  const toast = useToast()
  const navigate = useNavigate()

  const simplify = (value: number) => {
    if (value > 1000000) {
      return value / 1000000 + 'M'
    } else if (value > 1000) {
      return value / 1000 + 'K'
    }
    return value
  }

  // Stripe Payment Subscription
  const startPlan = async () => {
    const amount =
      currentPlan === 'month' ? (limit / 10000) * 200 : Math.ceil((limit / 10000) * 200 * 12 * 0.67)
    setLoading(true)
    const resp = await axios({
      method: 'POST',
      url: '/billing/new-prepaid-plan',
      data: {
        amount,
        plan: currentPlan,
        limit,
        billing_start: dayjs().add(1, 'd').unix(),
      },
    })
    setLoading(false)
    if (resp?.status === 200) {
      toast({
        position: 'top',
        description: `Your billing plan has been upgraded to Prepaid ${currentPlan}ly plan`,
        status: 'info',
        duration: 2000,
        isClosable: false,
      })
      navigate('/console/settings/billing')
    }
  }

  return (
    <>
      <SettingsHeader title='Billing Prepaid'></SettingsHeader>
      <Box width='100%'>
        <Section pt={4} pb={10}>
          <Flex direction='column'>
            <Text variant='title' color='black'>
              Save up to 33% with a prepaid plan
            </Text>
            <Text variant='paragraph' color='gray.300' mt={1}>
              Prepaid plans get a discount on our standard pay-as-you-go plan. Yearly prepaid plans
              are up to 33% cheaper per check run!
            </Text>
          </Flex>
          <Grid
            position='relative'
            templateColumns={{ base: '1fr', xl: '1fr 1fr' }}
            my={10}
            gap={6}
          >
            {loading && (
              <Flex
                position='absolute'
                top='0'
                left='0'
                zIndex='100'
                bg='rgba(255,255,255,0.8)'
                width='100%'
                height='100%'
                alignItems='center'
                justifyContent='center'
              >
                <Spinner
                  thickness='4px'
                  speed='0.65s'
                  emptyColor='gray.200'
                  color='blue.500'
                  size='xl'
                />
              </Flex>
            )}
            <PlanSelector planChanged={setCurrentPlan} limitChanged={setLimit}></PlanSelector>
            <Flex direction='column' mt={6}>
              <Text variant='details' color='gray.300'>
                New plan:
              </Text>
              <Text variant='title' color='black' mb={6}>
                Prepaid ({currentPlan}ly)
              </Text>

              <Flex alignItems='flex-end' justifyContent='space-between'>
                <Flex direction='column'>
                  <Text variant='details' color='gray.300'>
                    API check runs
                  </Text>
                  <Text variant='title' color='black' mb={1}>
                    {simplify(limit)}
                  </Text>
                  {currentPlan === 'year' && (
                    <Text variant='small' color='gray.300' mb={1}>
                      {simplify(limit * 12)}/year
                    </Text>
                  )}
                </Flex>
                <Flex direction='column'>
                  <Box>
                    <Text variant='header' color='black'>
                      ${((limit / 10000) * 2.0).toFixed(2)}
                    </Text>
                    <Text variant='paragraph' ml='1' color='gray.300'>
                      / month
                    </Text>
                  </Box>
                  {currentPlan === 'year' && (
                    <Box px='4'>
                      <Text variant='paragraph' ml='1' color='gray.300'>
                        {`$${((limit / 10000) * 2.0 * 12 * 0.67).toFixed(2)}/year`}
                      </Text>
                    </Box>
                  )}
                </Flex>
              </Flex>
              <Divider my={6}></Divider>
              <Flex justifyContent='space-between' mb={10}>
                <Flex direction='column'>
                  <Text variant='details' color='gray.300'>
                    Next payment on
                  </Text>
                  <Text variant='title' color='black' mb={1}>
                    {dayjs().add(1, currentPlan).format('MMM DD, YYYY')}
                  </Text>
                </Flex>
                <PrimaryButton
                  label='Start new plan'
                  disabled={loading}
                  variant='emphasis'
                  color={'white'}
                  onClick={startPlan}
                ></PrimaryButton>
              </Flex>
              <Flex direction='column' gap='4'>
                <Flex gap={2}>
                  <Icon as={FiAlertCircle} />
                  <Text variant='paragraph' color='darkgray.100'>
                    You will be charged the above amount at the start of each billing cycle
                  </Text>
                </Flex>
                <Flex gap={2}>
                  <Icon as={FiAlertCircle} />
                  <Text variant='paragraph' color='darkgray.100'>
                    If you run out of prepaid check runs in your billing cycle, we will bill
                    overages at the pay-as-you-go rate
                  </Text>
                </Flex>
                <Flex gap={2}>
                  <Icon as={FiAlertCircle} />
                  <Text variant='paragraph' color='darkgray.100'>
                    You can increase your prepaid amount at any time. You will receive credit for
                    unused checks
                  </Text>
                </Flex>
                <Flex gap={2}>
                  <Icon as={FiAlertCircle} />
                  <Text variant='paragraph' color='darkgray.100'>
                    When you decrease your prepaid amount, changes will take effect on the next
                    billing cycle. Unused checks are not credited
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Grid>
        </Section>
      </Box>
    </>
  )
}
