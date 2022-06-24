import { 
  Checkbox,
  Flex,
  Select,
  Switch,
  RadioGroup,
  Stack,
  Radio,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { NotificationChannel } from '@httpmon/db'
import { useFormContext } from 'react-hook-form'
import axios from 'axios'
import { useQuery } from 'react-query'
import { Text } from '../components'

export function MonitorNotifications() {
  const { register } = useFormContext()
  const { setValue, getValues, watch } = useFormContext()
  const [alertSetting, setAlertSetting] = useState<string>('failCount')

  const notifications = watch('notifications')

  useEffect(() => {
    setAlertSetting((!notifications.useGlobal && notifications.failTimeMS) ? 'failTimeMS' : 'failCount')
  }, [notifications])


  const alertSettingChanged = (value: string) => {
    setAlertSetting(value)
    setValue('notifications.failCount',  value === 'failCount' ? 1 : undefined)
    setValue('notifications.failTimeMS',  value === 'failTimeMS' ? 5 : undefined)
  }

  const { data: notificationChannels } = useQuery<NotificationChannel[]>(['notificaitons'], async () => {
    const resp = await axios({
      method: 'GET',
      url: '/settings/notifications',
    })
    return resp.data
  })

  const onChangeNotificationChannel = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const channels = getValues('notifications.channels') as string[]
    if (notificationChannels) {
      if (event.target.checked) {
        channels.push(notificationChannels[index].id ?? '')
      } else {
        const idx = channels.findIndex(channel => channel === notificationChannels[index].id)
        if (idx > -1) {
          channels.splice(idx, 1)
        }
      }
    }
    setValue('notifications.channels', channels)
  }

  const onChangeGlobalSetting = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('notifications.useGlobal',  event.target.checked)
    setValue('notifications.failCount',  undefined)
    setValue('notifications.failTimeMS',  undefined)
  }

  console.log('---- notifications', notifications)

  return (
    <>
      <Flex alignItems='center'>
        <Checkbox colorScheme='cyan' borderRadius={4} isChecked={notifications.useGlobal} onChange={onChangeGlobalSetting}>
          <Text variant='text-field' color='gray.300'>Use Global Settings</Text>
        </Checkbox>
      </Flex>
      <Flex direction='column' pl={6}>
        {!notifications.useGlobal && (
          <RadioGroup mt={6} value={alertSetting} onChange={alertSettingChanged}>
            <Stack direction='column' gap={2}>
              <Flex alignItems='center'>
                <Radio value='failCount'></Radio>
                <Text variant='text-field' whiteSpace='nowrap' mx={3} color='gray.300'>Notify when a monitor fails for</Text>
                <Select
                  width={20}
                  disabled={alertSetting !== 'failCount'}
                  borderRadius={8}
                  color='gray.300'
                  borderColor='gray.200'
                  value={getValues('notifications.failCount') || 1}
                  onChange={(e) => setValue('notifications.failCount', parseInt(e.target.value))}
                >
                  {Array(10).fill('').map((_, index) => (
                    <option key={index} value={index + 1}>{index + 1}</option>
                  ))}
                </Select>
                <Text variant='text-field' whiteSpace='nowrap' ml={3} color='gray.300'>time(s)</Text>
              </Flex>
              
              <Flex alignItems='center'>
                <Radio value='failTimeMS'></Radio>
                <Text variant='text-field' whiteSpace='nowrap' mx={3} color='gray.300'>Notify when a monitor fails for</Text>
                <Select
                  width={20}
                  disabled={alertSetting !== 'failTimeMS'}
                  borderRadius={8}
                  color='gray.300'
                  borderColor='gray.200'
                  value={getValues('notifications.failTimeMS') || 5}
                  onChange={(e) => setValue('notifications.failTimeMS', parseInt(e.target.value))}
                >
                  <option value='5'>5</option>
                  <option value='10'>10</option>
                  <option value='15'>15</option>
                  <option value='20'>20</option>
                  <option value='30'>30</option>
                  <option value='60'>60</option>
                </Select>
                <Text variant='text-field' whiteSpace='nowrap' ml={3} color='gray.300'>minutes</Text>
              </Flex>
            </Stack>
          </RadioGroup>
        )}
      </Flex>
      <Flex direction='column' mt={6} gap={6}>
        <Text variant='text-field' color='darkgray.300'>Channels</Text>
        {notificationChannels?.map((notificationChannel, index) => (
          <Flex
            ml={6}
            borderWidth='1px'
            borderColor={'gray.200'}
            borderStyle='solid'
            borderRadius={8}
            px={3}
            py={2}
            alignItems='center'
            justifyContent='space-between'
            maxW={'600px'}
            key={index}
          >
            <Text variant='text-field' textOverflow='ellipsis' overflow='hidden' whiteSpace='nowrap' color='gray.300'>
              {notificationChannel.name}
            </Text>
            <Switch
              isChecked={notifications.channels.includes(notificationChannel.id)}
              onChange={(event) => onChangeNotificationChannel(event, index)}
            />
          </Flex>
        ))}
      </Flex>
    </>
  )
}
