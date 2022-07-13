import { Flex, Select, Switch, RadioGroup, Stack, Radio, Box, Image } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { NotificationChannel } from '@httpmon/db'
import { useFormContext } from 'react-hook-form'
import axios from 'axios'
import { useQuery } from 'react-query'
import { Text } from '../components'
import { BlueEmailIcon, MSTeamsIcon, SlackIcon } from '../Assets'

interface Props {
  notificationChannels?: NotificationChannel[]
}

export function MonitorNotifications({ notificationChannels }: Props) {
  const { setValue, getValues, watch } = useFormContext()
  const [alertSetting, setAlertSetting] = useState<string>('failCount')

  const notifications = watch('notifications')

  useEffect(() => {
    setAlertSetting(
      !notifications.useGlobal && notifications.failTimeMinutes ? 'failTimeMinutes' : 'failCount'
    )
  }, [notifications])

  const alertSettingChanged = (value: string) => {
    setAlertSetting(value)
    setValue('notifications.failCount', value === 'failCount' ? 1 : undefined)
    setValue('notifications.failTimeMinutes', value === 'failTimeMinutes' ? 5 : undefined)
  }

  const onChangeNotificationChannel = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const channels = getValues('notifications.channels') as string[]
    if (notificationChannels) {
      if (event.target.checked) {
        channels.push(notificationChannels[index].id ?? '')
      } else {
        const idx = channels.findIndex((channel) => channel === notificationChannels[index].id)
        if (idx > -1) {
          channels.splice(idx, 1)
        }
      }
    }
    setValue('notifications.channels', channels)
  }

  const onChangeGlobalSetting = (value: string) => {
    setValue('notifications', {
      useGlobal: value == '1',
      failCount: value == '1' ? undefined : 1,
      failTimeMinutes: undefined,
      channels: notifications.channels,
    })
  }

  return (
    <>
      <Flex alignItems='center'>
        {/* <Checkbox colorScheme='cyan' borderRadius={4} isChecked={notifications.useGlobal} onChange={onChangeGlobalSetting}>
          <Text variant='text-field' color='gray.300'>Use Global Settings</Text>
        </Checkbox> */}
        <RadioGroup
          mt={2}
          mb={4}
          value={notifications.useGlobal ? '1' : '0'}
          onChange={onChangeGlobalSetting}
        >
          <Stack direction='column' gap={4}>
            <Flex alignItems='center'>
              <Radio value='1' colorScheme='cyan'>
                <Text variant='paragraph' whiteSpace='nowrap' mx={3} color='darkgray.100'>
                  Use global notifications
                </Text>
              </Radio>
            </Flex>
            <Flex alignItems='center'>
              <Radio value='0' colorScheme='cyan'>
                <Text variant='paragraph' whiteSpace='nowrap' mx={3} color='darkgray.100'>
                  Set notification settings
                </Text>
              </Radio>
            </Flex>
          </Stack>
        </RadioGroup>
      </Flex>
      <Flex direction='column' borderTop={'1px solid'} borderColor='gray.200'>
        {!notifications.useGlobal && (
          <RadioGroup mt={4} value={alertSetting} onChange={alertSettingChanged}>
            <Stack direction='column' gap={2}>
              <Flex alignItems='center'>
                <Radio value='failCount' colorScheme='cyan'>
                  <Text variant='paragraph' whiteSpace='nowrap' mx={3} color='darkgray.100'>
                    Notify when a monitor fails{' '}
                  </Text>
                </Radio>
                <Select
                  width={20}
                  disabled={alertSetting !== 'failCount'}
                  borderRadius={8}
                  color='gray.300'
                  borderColor='gray.200'
                  value={getValues('notifications.failCount') || 1}
                  onChange={(e) => setValue('notifications.failCount', parseInt(e.target.value))}
                >
                  {Array(10)
                    .fill('')
                    .map((_, index) => (
                      <option key={index} value={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                </Select>
                <Text variant='paragraph' whiteSpace='nowrap' ml={3} color='darkgray.100'>
                  time(s) in a row
                </Text>
              </Flex>

              <Flex alignItems='center'>
                <Radio value='failTimeMinutes' colorScheme='cyan'>
                  <Text variant='paragraph' whiteSpace='nowrap' mx={3} color='darkgray.100'>
                    Notify when a monitor is failing for
                  </Text>
                </Radio>
                <Select
                  width={20}
                  disabled={alertSetting !== 'failTimeMinutes'}
                  borderRadius={8}
                  color='gray.300'
                  borderColor='gray.200'
                  value={getValues('notifications.failTimeMinutes') || 5}
                  onChange={(e) =>
                    setValue('notifications.failTimeMinutes', parseInt(e.target.value))
                  }
                >
                  <option value='5'>5</option>
                  <option value='10'>10</option>
                  <option value='15'>15</option>
                  <option value='20'>20</option>
                  <option value='30'>30</option>
                  <option value='60'>60</option>
                </Select>
                <Text variant='paragraph' whiteSpace='nowrap' ml={3} color='darkgray.100'>
                  minutes
                </Text>
              </Flex>
            </Stack>
          </RadioGroup>
        )}
      </Flex>
      {!notifications.useGlobal && (
        <Flex direction='column' mt={4} gap={6} borderTop={'1px solid'} borderColor='gray.200'>
          <Text variant='text-field' mt={6} color='darkgray.300'>
            Notifications added
          </Text>
          {notificationChannels?.map((notificationChannel, index) => (
            <Flex
              borderWidth='1px'
              borderColor={'gray.200'}
              borderStyle='solid'
              borderRadius={8}
              px={4}
              py={1.5}
              alignItems='center'
              justifyContent='space-between'
              maxW={'600px'}
              key={index}
              gap={2}
            >
              <Flex alignItems='center' gap={2}>
                {notificationChannel.channel.type === 'slack' && (
                  <Box
                    border='1px solid'
                    borderColor='gray.200'
                    w={8}
                    h={8}
                    bg='white'
                    borderRadius='18'
                    p={1.5}
                  >
                    <Image src={SlackIcon} objectFit='contain'></Image>
                  </Box>
                )}
                {notificationChannel.channel.type === 'ms-teams' && (
                  <Box
                    border='1px solid'
                    borderColor='gray.200'
                    w={8}
                    h={8}
                    bg='white'
                    borderRadius='18'
                    p={1.5}
                  >
                    <Image src={MSTeamsIcon} objectFit='contain'></Image>
                  </Box>
                )}
                {notificationChannel.channel.type === 'email' && (
                  <Image src={BlueEmailIcon} w={8} h={8} objectFit='contain'></Image>
                )}
                <Text
                  variant='text-field'
                  textOverflow='ellipsis'
                  overflow='hidden'
                  whiteSpace='nowrap'
                  color='gray.300'
                >
                  {notificationChannel.name}
                </Text>
              </Flex>
              <Switch
                colorScheme='cyan'
                isChecked={notifications.channels.includes(notificationChannel.id)}
                onChange={(event) => onChangeNotificationChannel(event, index)}
              />
            </Flex>
          ))}
        </Flex>
      )}
    </>
  )
}
