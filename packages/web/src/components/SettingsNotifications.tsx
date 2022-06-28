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
  useToast,
} from '@chakra-ui/react'
import { FiBell, FiEdit, FiTrash2 } from 'react-icons/fi'
import { useFormContext } from 'react-hook-form'
import { useOutletContext } from 'react-router-dom'
import axios from 'axios'
import { NotificationChannel } from '@httpmon/db'
import { Section, Text, ChannelSelect } from '../components'
import { SettingFormValidation, NotificationFormErrors } from '../types/common'

interface Props {
  errors: NotificationFormErrors
}

function NewNotification({ errors }: Props) {
  const { register, setValue, watch, getValues } = useFormContext()

  const newNotification = watch('settings.new_notification')

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
            borderColor={errors.name ? 'red' : 'gray.200'}
            type='text'
            width='80'
            {...register('settings.new_notification.name' as const)}
          />
          {errors.name && <Text variant='details' color='red'>* Name Required</Text>}
        </Flex>
        <Flex direction='column'>
          <Text variant='details' mb={1} color='black'>Type</Text>
          <ChannelSelect
            channel={newNotification.channel.type}
            onSelect={selectChannel}
            hasError={errors.channel?.type || false}
          />
          {errors.channel?.type && <Text variant='details' color='red'>* Channel Required</Text>}
        </Flex>
      </Flex>
      {newNotification.channel.type === 'email' && (
        <Flex gap='4' flexWrap='wrap' mb={6}>
          <Flex direction='column'>
            <Text variant='details' mb={1} color='black'>Email *</Text>
            <Input
              borderRadius={8}
              borderColor={errors.channel?.email ? 'red' : 'gray.200'}
              type='text'
              width='80'
              placeholder='Email1, email2, email3, ...'
              {...register('settings.new_notification.channel.email' as const)}
            />
            {errors.channel?.email && <Text variant='details' color='red'>* Email Required</Text>}
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
      {(newNotification.channel.type === 'slack' || newNotification.channel.type === 'ms-teams') && (
        <Flex mb={6}>
          <Flex direction='column'>
            <Text variant='details' mb={1} color='black'>Webhook URL</Text>
            <Input
              borderRadius={8}
              borderColor={errors.channel?.webhookUrl ? 'red' : 'gray.200'}
              type='text'
              width='96'
              {...register('settings.new_notification.channel.webhookUrl' as const)}
            />
            {errors.channel?.webhookUrl && <Text variant='details' color='red'>* Webhook URL Required</Text>}
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

function EditNotification({ errors }: Props) {
  const { register, setValue, watch, getValues } = useFormContext()

  const editNotification = watch('settings.edit_notification')

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
              borderColor={errors.name ? 'red' : 'gray.200'}
              type='text'
              width='80'
              {...register('settings.edit_notification.name' as const)}
            />
            {errors.name && <Text variant='details' color='red'>* Name Required</Text>}
          </Flex>
          <Flex direction='column'>
            <Text variant='details' mb={1} color='black'>Type</Text>
            <ChannelSelect
              channel={editNotification.channel.type}
              onSelect={selectChannel}
              hasError={errors.channel?.type || false}
            />
            {errors.channel?.type && <Text variant='details' color='red'>* Channel Required</Text>}
          </Flex>
        </Flex>
        {editNotification.channel.type === 'email' && (
          <Flex gap='4' flexWrap='wrap' mb={6}>
            <Flex direction='column'>
              <Text variant='details' mb={1} color='black'>Email *</Text>
              <Input
                borderRadius={8}
                borderColor={errors.channel?.email ? 'red' : 'gray.200'}
                type='text'
                width='80'
                placeholder='Email1, email2, email3, ...'
                {...register('settings.edit_notification.channel.email' as const)}
              />
              {errors.channel?.email && <Text variant='details' color='red'>* Email Required</Text>}
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
        {(editNotification.channel.type === 'slack' || editNotification.channel.type === 'ms-teams') && (
          <Flex mb={6}>
            <Flex direction='column'>
              <Text variant='details' mb={1} color='black'>Webhook URL</Text>
              <Input
                borderRadius={8}
                borderColor={errors.channel?.webhookUrl ? 'red' : 'gray.200'}
                type='text'
                width='96'
                {...register('settings.edit_notification.channel.webhookUrl' as const)}
              />
              {errors.channel?.webhookUrl && <Text variant='details' color='red'>* Webhook URL Required</Text>}
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
  const { errors }: { errors: SettingFormValidation} = useOutletContext();
  const { setValue, getValues } = useFormContext()
  const [alertSetting, setAlertSetting] = useState<string|undefined>()
  const toast = useToast()

  const notifications = getValues('settings.notifications')
  const editNotification = getValues('settings.edit_notification')

  useEffect(() => {
    const alertSettings = getValues('settings.alert')
    if (alertSettings.failCount) {
      setAlertSetting('failCount')
    } else if (alertSettings.failTimeMinutes) {
      setAlertSetting('failTimeMinutes')
    }
  }, [])

  const alertSettingChanged = (value: string) => {
    setAlertSetting(value)
    setValue('settings.alert', {
      failCount: value === 'failCount' ? 1 : undefined,
      failTimeMinutes: value === 'failTimeMinutes' ? 5 : undefined,
    })
  }

  const onSelectNotification = (notification: NotificationChannel) => {
    setValue('settings.edit_notification', notification)
  }

  const deleteNotification = (id: string | undefined) => {
    if (id) {
      axios.delete(`/settings/notifications/${id}`)
        .then(() => {
          const newNotifications = notifications.filter((notification: NotificationChannel) => notification.id !== id)
          setValue('settings.notifications', newNotifications)
          toast({
            position: 'top',
            description: 'Notification has been removed successfully.',
            status: 'info',
            duration: 2000,
          })
        })
    }
  }

  return (
    <Box width='100%'>
      <Section pt={4} pb={6}>
        <Text variant='title' color='black'>Alert Settings</Text>
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
                value={getValues('settings.alert.failCount') || 1}
                onChange={(e) => setValue('settings.alert.failCount', parseInt(e.target.value))}
              >
                {Array(10).fill('').map((_, index) => (
                  <option key={index} value={index + 1}>{index + 1}</option>
                ))}
              </Select>
              <Text variant='text-field' whiteSpace='nowrap' ml={3} color='gray.300'>time(s)</Text>
            </Flex>
            
            <Flex alignItems='center'>
              <Radio value='failTimeMinutes'></Radio>
              <Text variant='text-field' whiteSpace='nowrap' mx={3} color='gray.300'>Notify when a monitor fails for</Text>
              <Select
                width={20}
                disabled={alertSetting !== 'failTimeMinutes'}
                borderRadius={8}
                color='gray.300'
                borderColor='gray.200'
                value={getValues('settings.alert.failTimeMinutes') || 5}
                onChange={(e) => setValue('settings.alert.failTimeMinutes', parseInt(e.target.value))}
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
          {notifications?.map((notification: NotificationChannel) => (
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
                  <Icon as={FiBell} w={6} h={6} mr={2} />
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
              <Button
                w={6}
                h={6}
                minW={6}
                borderRadius='4'
                bg='lightgray.100'
                p='0'
                onClick={() => deleteNotification(notification.id)}
              >
                <Icon color='gray.300' fontSize={'xs'} as={FiTrash2} cursor='pointer' />
              </Button>
            </Flex>
          ))}
        </Flex>
      </Section>
      {editNotification.id ? <EditNotification errors={errors.edit_notification} /> : <NewNotification errors={errors.new_notification} />}
    </Box>
  )
}
