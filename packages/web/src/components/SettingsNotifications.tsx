import { useEffect, useState } from 'react'
import {
  Box,
  Flex,
  Input,
  Select,
  FormControl,
  Switch,
  FormLabel,
  Icon, 
  RadioGroup,
  Radio,
  Stack,
  Button,
} from '@chakra-ui/react'
import { FiBell, FiEdit } from 'react-icons/fi'
import { useFormContext, } from 'react-hook-form'
import { NotificationChannel } from '@httpmon/db'
import { Section, Text, ChannelSelect } from '../components'

function NewNotification() {
  const { register, setValue, watch, getValues } = useFormContext()

  const channel = watch('settings.new_notification.channel.type')

  const selectChannel = (value: string) => {
    setValue('settings.new_notification.channel', { type: value })
  }

  return (
    <Section pt={4} pb={6} mb={0}>
      <Text variant='title' color='black'>Add new notification</Text>
      <Flex gap='4' flexWrap='wrap' mt={8} mb={6}>
        <Flex direction='column'>
          <Text variant='details' mb={1} color='black'>Name</Text>
          <Input
            borderRadius={8}
            borderColor='gray.200'
            type='text'
            width='80'
            {...register('settings.new_notification.name' as const)}
          />
        </Flex>
        <Flex direction='column'>
          <Text variant='details' mb={1} color='black'>Type</Text>
          <ChannelSelect channel={channel} onSelect={selectChannel} />
        </Flex>
      </Flex>
      {channel === 'email' && (
        <Flex gap='4' flexWrap='wrap' mb={6}>
          <Flex direction='column'>
            <Text variant='details' mb={1} color='black'>Email *</Text>
            <Input
              borderRadius={8}
              borderColor='gray.200'
              type='text'
              width='80'
              placeholder='Email1, email2, email3, ...'
              {...register('settings.new_notification.channel.email' as const)}
            />
          </Flex>
          <Flex direction='column'>
            <Text variant='details' mb={1} color='black'>CC</Text>
            <Input
              borderRadius={8}
              borderColor='gray.200'
              type='text'
              width='80'
              placeholder='Email1, email2, email3, ...'
              {...register('settings.new_notification.channel.cc' as const)}
            />
          </Flex>
          <Flex direction='column'>
            <Text variant='details' mb={1} color='black'>Recipient Name</Text>
            <Input
              borderRadius={8}
              borderColor='gray.200'
              type='text'
              width='80'
              {...register('settings.new_notification.channel.recipientName' as const)}
            />
          </Flex>
        </Flex>
      )}
      {(channel === 'slack' || channel === 'ms-teams') && (
        <Flex mb={6}>
          <Flex direction='column'>
            <Text variant='details' mb={1} color='black'>Webhook URL</Text>
            <Input
              borderRadius={8}
              borderColor='gray.200'
              type='text'
              width='96'
              {...register('settings.new_notification.channel.webhookUrl' as const)}
            />
          </Flex>
        </Flex>
      )}
      <Box mt={4}>
        <FormControl display='flex' alignItems='center'>
          <Switch
            id='default_enabled'
            size="sm"
            mr={2}
            isChecked={getValues('settings.new_notification.isDefaultEnabled')}
            {...register('settings.new_notification.isDefaultEnabled' as const)}
          />
          <FormLabel htmlFor='default_enabled' m={0}>
            <Text variant='text-field' color='black'>Default enabled</Text>
          </FormLabel>
        </FormControl>
      </Box>
      <Box mt={4}>
        <FormControl display='flex' alignItems='center'>
          <Switch
            id='apply-on-all'
            size="sm"
            mr={2}
            isChecked={getValues('settings.new_notification.applyOnExistingMonitors')}
            {...register('settings.new_notification.applyOnExistingMonitors' as const)}
          />
          <FormLabel htmlFor='apply-on-all' m={0}>
            <Text variant='text-field' color='black'>Apply on all existing monitors</Text>
          </FormLabel>
        </FormControl>
      </Box>
    </Section>
  )
}

function EditNotification() {
  const { register, setValue, watch, getValues } = useFormContext()

  const channel = watch('settings.edit_notification.channel.type')

  const selectChannel = (value: string) => {
    setValue('settings.edit_notification.channel', { type: value })
  }

  return (
    <Box width='100%'>
      <Section pt={4} pb={6} mt={2} mb={0}>
        <Text variant='title' color='black'>Edit notification</Text>
        <Flex gap='4' flexWrap='wrap' mt={8} mb={6}>
          <Flex direction='column'>
            <Text variant='details' mb={1} color='black'>Name</Text>
            <Input
              borderRadius={8}
              borderColor='gray.200'
              type='text'
              width='80'
              {...register('settings.edit_notification.name' as const)}
            />
          </Flex>
          <Flex direction='column'>
            <Text variant='details' mb={1} color='black'>Type</Text>
            <ChannelSelect channel={channel} onSelect={selectChannel} />
          </Flex>
        </Flex>
        {channel === 'email' && (
          <Flex gap='4' flexWrap='wrap' mb={6}>
            <Flex direction='column'>
              <Text variant='details' mb={1} color='black'>Email *</Text>
              <Input
                borderRadius={8}
                borderColor='gray.200'
                type='text'
                width='80'
                placeholder='Email1, email2, email3, ...'
                {...register('settings.edit_notification.channel.email' as const)}
              />
            </Flex>
            <Flex direction='column'>
              <Text variant='details' mb={1} color='black'>CC</Text>
              <Input
                borderRadius={8}
                borderColor='gray.200'
                type='text'
                width='80'
                placeholder='Email1, email2, email3, ...'
                {...register('settings.edit_notification.channel.cc' as const)}
              />
            </Flex>
            <Flex direction='column'>
              <Text variant='details' mb={1} color='black'>Recipient Name</Text>
              <Input
                borderRadius={8}
                borderColor='gray.200'
                type='text'
                width='80'
                {...register('settings.edit_notification.channel.recipientName' as const)}
              />
            </Flex>
          </Flex>
        )}
        {(channel === 'slack' || channel === 'ms-teams') && (
          <Flex mb={6}>
            <Flex direction='column'>
              <Text variant='details' mb={1} color='black'>Webhook URL</Text>
              <Input
                borderRadius={8}
                borderColor='gray.200'
                type='text'
                width='96'
                {...register('settings.edit_notification.channel.webhookUrl' as const)}
              />
            </Flex>
          </Flex>
        )}
        <Box mt={4}>
          <FormControl display='flex' alignItems='center'>
            <Switch
              id='edit-default_enabled'
              size="sm"
              mr={2}
              isChecked={getValues('settings.edit_notification.isDefaultEnabled')}
              {...register('settings.edit_notification.isDefaultEnabled' as const)}
            />
            <FormLabel htmlFor='edit-default_enabled' m={0}>
              <Text variant='text-field' color='black'>Default enabled</Text>
            </FormLabel>
          </FormControl>
        </Box>
        <Box mt={4}>
          <FormControl display='flex' alignItems='center'>
            <Switch
              id='edit-apply-on-all'
              size="sm"
              mr={2}
              isChecked={getValues('settings.edit_notification.applyOnExistingMonitors')}
              {...register('settings.edit_notification.applyOnExistingMonitors' as const)}
            />
            <FormLabel htmlFor='edit-apply-on-all' m={0}>
              <Text variant='text-field' color='black'>Apply on all existing monitors</Text>
            </FormLabel>
          </FormControl>
        </Box>
      </Section>
    </Box>
  )
}

export default function SettingsNotifications() {
  const { register, setValue, getValues } = useFormContext()
  const [alertSetting, setAlertSetting] = useState<string|undefined>()
  const [selectedNotification, setSelectedNotification] = useState<string|undefined>()

  useEffect(() => {
    const alertSettings = getValues('settings.alert')
    if (alertSettings.failCount) {
      setAlertSetting('failCount')
    } else if (alertSettings.failTimeMS) {
      setAlertSetting('failTimeMS')
    }
  }, [])

  const alertSettingChanged = (value: string) => {
    setAlertSetting(value)
    setValue('settings.alert', {
      failCount: null,
      failTimeMS: null,
    })
  }

  const onSelectNotification = (notification: NotificationChannel) => {
    setSelectedNotification(notification.id)
    setValue('settings.edit_notification', notification)
  }

  const notifications = getValues('settings.notifications')

  return (
    <Box width='100%'>
      <Section pt={4} pb={6}>
        <Text variant='title' color='black'>Alert Settings</Text>
        <RadioGroup mt={6} value={alertSetting} onChange={alertSettingChanged}>
          <Stack direction='column' gap={2}>
            <Flex alignItems='center'>
              <Radio value='failCount'></Radio>
              <Text variant='text-field' whiteSpace='nowrap' mx={3} color='gray.300'>Notify after</Text>
              <Select
                width={20}
                disabled={alertSetting !== 'failCount'}
                borderRadius={8}
                color='gray.300'
                borderColor='gray.200'
                {...register('settings.alert.failCount')}
              >
                {Array(10).fill('').map((_, index) => (
                  <option key={index} value={index + 1}>{index + 1}</option>
                ))}
              </Select>
              <Text variant='text-field' whiteSpace='nowrap' ml={3} color='gray.300'>number of failures</Text>
            </Flex>
            
            <Flex alignItems='center'>
              <Radio value='failTimeMS'></Radio>
              <Text variant='text-field' whiteSpace='nowrap' mx={3} color='gray.300'>Notify after taking on</Text>
              <Select
                width={20}
                disabled={alertSetting !== 'failTimeMS'}
                borderRadius={8}
                color='gray.300'
                borderColor='gray.200'
                {...register('settings.alert.failTimeMS')}
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
      </Section>
      <Section pt={4} pb={6} minH={60}>
        <Text variant='title' color='black'>Notifications</Text>
        <Flex flexWrap={'wrap'} gap={4} mt={7}>
          {notifications?.map((notification: NotificationChannel, index: number) => (
            <Flex
              key={notification.id}
              gap={2}
              px={4}
              py={3}
              borderRadius='8'
              borderWidth='1px'
              borderColor='gray.200'
              borderStyle='solid'
              width='100%'
              maxW={'656px'}
              justifyContent='space-between'
            >
              <Flex alignItems='center' flex='1' gap={2} flexWrap='wrap'>
                <Flex alignItems='center'>
                  <Icon as={FiBell} mr={2} />
                  <Text
                    variant='text-field'
                    className='captialize-first-letter'
                    maxW='calc(100vw - 580px)'
                    overflow='hidden'
                    textOverflow='ellipsis'
                    whiteSpace='nowrap'
                    color='black'
                  >
                    {notification.name}
                  </Text>
                </Flex>
              </Flex>
              <Button
                w={6}
                h={6}
                minW={6}
                borderRadius='4'
                bg='lightgray.100'
                p='0'
                onClick={() => onSelectNotification(notification)}
              >
                <Icon color='gray.300' fontSize={'xs'} as={FiEdit} cursor='pointer' />
              </Button>
            </Flex>
          ))}
        </Flex>
      </Section>
      <NewNotification />
      {selectedNotification && <EditNotification />}
    </Box>
  )
}
