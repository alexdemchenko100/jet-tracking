import { Box, Flex, Divider, Icon, useToast } from '@chakra-ui/react'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import { FiAlertCircle } from 'react-icons/fi'
import { PrimaryButton, Section, SettingsHeader, Text } from '../components'

export default function SettingsBillingPayAsYouGo() {
  const toast = useToast()
  const navigate = useNavigate()

  const startPlan = async () => {
    const resp = await axios({
      method: 'POST',
      url: '/billing/pay-as-you-go-plan',
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
    <>
      <SettingsHeader title='Pay As You Go'></SettingsHeader>
      <Box width='100%'>
        <Section pt={4} pb={10}>
          <Box>
            <Text variant='title' color='black'>
              Confirm your payment
            </Text>
          </Box>
          <Flex direction='column' mt={6}>
            <Text variant='details' color='gray.300'>
              New plan:
            </Text>
            <Text variant='title' color='black' mb={6}>
              Pay as you go
            </Text>
            <Text variant='header' color='black' mb={1}>
              $2.50
            </Text>
            <Text variant='details' color='gray.300'>
              for 10k API check runs
            </Text>
            <Divider my={6}></Divider>
            <Flex justifyContent='space-between' mb={10}>
              <Flex direction='column'>
                <Text variant='details' color='gray.300'>
                  Next payment on
                </Text>
                <Text variant='title' color='black' mb={1}>
                  {dayjs().add(1, 'month').format('MMM DD, YYYY')}
                </Text>
              </Flex>
              <PrimaryButton
                label='Start new plan'
                variant='emphasis'
                color={'white'}
                onClick={startPlan}
              ></PrimaryButton>
            </Flex>
            <Flex direction='column' gap='4'>
              <Flex gap={2}>
                <Icon as={FiAlertCircle} />
                <Text variant='paragraph' color='darkgray.100'>
                  You will be charged for the exact amount of checks you run at the end of your
                  billing cycle
                </Text>
              </Flex>
              <Flex gap={2}>
                <Icon as={FiAlertCircle} />
                <Text variant='paragraph' color='darkgray.100'>
                  You can change to a Prepaid plan at any time for better rates
                </Text>
              </Flex>
              <Flex gap={2}>
                <Icon as={FiAlertCircle} />
                <Text variant='paragraph' color='darkgray.100'>
                  Based on your location and VAT status, VAT may be applied to your final bill
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Section>
      </Box>
    </>
  )
}
