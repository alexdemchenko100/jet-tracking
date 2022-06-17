import { Divider, Flex, FormLabel, Heading, Input, Button, Box } from '@chakra-ui/react'
import { useAuth } from '../services/FirebaseAuth'
import { Notification } from '@httpmon/db'
import axios from 'axios'
import { useQuery } from 'react-query'

export function Settings() {
  const { userInfo } = useAuth()

  const { data: notifications } = useQuery<Notification[], Error>(
    ['notifications'],
    () => getNotifications(),
    {}
  )

  const getNotifications = async () => {
    const res = await axios({
      method: 'GET',
      url: `/settings/notifications`,
    })
    return res.data
  }

  const addNotification = () => {
    axios({
      method: 'POST',
      url: `/settings/notifications`,
      data: {
        name: 'Test notification - ' + new Date().toISOString(),
        failCount: 6, // possible value: 1 - 10
        failTimeMS: 20, // possible value: null, 5, 10, 15, 20, 30, 60
        isDefaultEnabled: true,
        applyOnExistingMonitors: true,
        // channel: { // Email channel
        //   email: 'test@email.com, test2@email.com',
        //   cc: 'cc.test@email.com',
        //   recipientName: 'John Doe',
        // },
        channel: { // Slack channel
          webhookUrl: 'https://hooks.slack.com/services/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'
        },
        // channel: { // Microsoft Teams channel
        //   webhookUrl: 'https://hooks.microsoft-teams.com/services/T03LER2T32M/B03KZ97ECHK/M8BuslbsVThKu8BGQKzkJ2PD'
        // },
      }
    }).then(res => {
      console.log('new notification:', res.data)
    })
  }

  return (
    <Flex direction='column' gap='4' m={2}>
      <Heading size='md'>Settings</Heading>
      <Divider />
      <Flex direction='column' gap='2' boxShadow='lg' p='2' bgColor=''>
        <form>
          <FormLabel htmlFor='name'>Name</FormLabel>
          <Input value={userInfo.displayName} isDisabled />
          <FormLabel htmlFor='name'>Email</FormLabel>
          <Input value={userInfo.email} isDisabled />
        </form>
      </Flex>
      <Box my={5}>
        <Button bg={'darkblue.100'} colorScheme='white' onClick={addNotification}>Add dummy notifcation</Button>
        <Box my={5}>
          {notifications && notifications.map(notification => (
            <Flex my={4} gap={4} key={notification.id}>
              <Box>Name: <Box color='darkblue.100'>{notification.name}</Box></Box>
              <Box>Failure count: <Box color='darkblue.100'>{notification.failCount}</Box></Box>
              <Box>Failure Mins: <Box color='darkblue.100'>{notification.failTimeMS ? notification.failTimeMS : 'Null'}</Box></Box>
              <Box>Default enabled: <Box color='darkblue.100'>{notification.isDefaultEnabled ? 'true' : 'false'}</Box></Box>
              <Box>Apply On Existing Monitors: <Box color='darkblue.100'>{notification.applyOnExistingMonitors ? 'true' : 'false'}</Box></Box>
            </Flex>
          ))}
        </Box>
      </Box>
    </Flex>
  )
}
