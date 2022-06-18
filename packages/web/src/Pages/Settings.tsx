import { Divider, Flex, FormLabel, Heading, Input, Button, Box } from '@chakra-ui/react'
import { useAuth } from '../services/FirebaseAuth'
import { NotificationChannel } from '@httpmon/db'
import axios from 'axios'
import { useQuery } from 'react-query'

export function Settings() {
  const { userInfo } = useAuth()

  const { data: notifications } = useQuery<NotificationChannel[], Error>(
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
        channel: { // Email channel
          email: 'test@email.com, test2@email.com',
          cc: 'cc.test@email.com',
          recipientName: 'John Doe',
        },
      }
    }).then(res => {
      console.log('new notification:', res.data)
    })
  }

  const updateNotification = () => {
    if (notifications && notifications.length > 0) {
      axios({
        method: 'PUT',
        url: `/settings/notifications/${notifications[0].id}`,
        data: {
          name: 'Update first notification - ' + new Date().toISOString(),
          failCount: 1, // possible value: 1 - 10
          failTimeMS: 60, // possible value: null, 5, 10, 15, 20, 30, 60
          isDefaultEnabled: false,
          applyOnExistingMonitors: false,
          channel: { // Email channel
            email: 'test@email.com, test2@email.com',
            cc: 'cc.test@email.com',
            recipientName: 'John Doe',
          },
        }
      }).then(res => {
        console.log('update notification successfully: ', res.data)
      })
    }
  }

  const deleteNotification = () => {
    if (notifications && notifications.length > 0) {
      axios({
        method: 'DELETE',
        url: `/settings/notifications/${notifications[0].id}`,
      }).then(res => {
        console.log('delete notification successfully')
      })
    }
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
        <Flex gap={3}>
          <Button bg={'darkblue.100'} colorScheme='white' onClick={addNotification}>Add dummy notifcation</Button>
          <Button colorScheme='green' onClick={updateNotification}>Update notifcation</Button>
          <Button colorScheme='red' onClick={deleteNotification}>Delete notifcation</Button>
        </Flex>
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
