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
  Grid,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react'
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi'
import { useFormContext } from 'react-hook-form'
import { useOutletContext } from 'react-router-dom'
import axios from 'axios'
import { NotificationChannel } from '@httpmon/db'
import { Section, Text, ChannelSelect, PrimaryButton } from '../components'
import { SettingFormValidation, NotificationFormErrors } from '../types/common'
import { BlueEmailIcon, MSTeamsIcon, SlackIcon } from '../Assets'

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
    <>
      <Flex gap='6' flexWrap='wrap' mt={2} mb={6}>
        <Flex direction='column' w='100%'>
          <Text variant='details' mb={1} color='black'>Name</Text>
          <Input
            borderRadius={8}
            borderColor={errors.name ? 'red' : 'gray.200'}
            type='text'
            {...register('settings.new_notification.name' as const)}
          />
          {errors.name && <Text variant='details' color='red'>* Name Required</Text>}
        </Flex>
        <Flex direction='column' w='100%'>
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
          <Flex direction='column' w='100%'>
            <Text variant='details' mb={1} color='black'>Email *</Text>
            <Input
              borderRadius={8}
              borderColor={errors.channel?.email ? 'red' : 'gray.200'}
              type='text'
              placeholder='Email1, email2, email3, ...'
              {...register('settings.new_notification.channel.email' as const)}
            />
            {errors.channel?.email && <Text variant='details' color='red'>* Email Required</Text>}
          </Flex>
          <Flex direction='column' w='100%'>
            <Text variant='details' mb={1} color='black'>CC</Text>
            <Input
              borderRadius={8}
              borderColor='gray.200'
              type='text'
              placeholder='Email1, email2, email3, ...'
              {...register('settings.new_notification.channel.cc' as const)}
            />
          </Flex>
          <Flex direction='column' w='100%'>
            <Text variant='details' mb={1} color='black'>Recipient Name</Text>
            <Input
              borderRadius={8}
              borderColor='gray.200'
              type='text'
              {...register('settings.new_notification.channel.recipientName' as const)}
            />
          </Flex>
        </Flex>
      )}
      {(newNotification.channel.type === 'slack' || newNotification.channel.type === 'ms-teams') && (
        <Flex mb={6}>
          <Flex direction='column' w='100%'>
            <Text variant='details' mb={1} color='black'>Webhook URL</Text>
            <Input
              borderRadius={8}
              borderColor={errors.channel?.webhookUrl ? 'red' : 'gray.200'}
              type='text'
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
    </>
  )
}

function EditNotification({ errors }: Props) {
  const { register, setValue, watch, getValues } = useFormContext()

  const editNotification = watch('settings.edit_notification')

  const selectChannel = (value: string) => {
    setValue('settings.edit_notification', {
      channel: {
        type: value,
        email: null,
        webhookUrl: null,
      }
    })
  }

  return (
    <>
      <Flex gap='6' flexWrap='wrap' mt={2} mb={6}>
        <Flex direction='column' w='100%'>
          <Text variant='details' mb={1} color='black'>Name</Text>
          <Input
            borderRadius={8}
            borderColor={errors.name ? 'red' : 'gray.200'}
            type='text'
            {...register('settings.edit_notification.name' as const)}
          />
          {errors.name && <Text variant='details' color='red'>* Name Required</Text>}
        </Flex>
        <Flex direction='column' w='100%'>
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
          <Flex direction='column' w='100%'>
            <Text variant='details' mb={1} color='black'>Email *</Text>
            <Input
              borderRadius={8}
              borderColor={errors.channel?.email ? 'red' : 'gray.200'}
              type='text'
              placeholder='Email1, email2, email3, ...'
              {...register('settings.edit_notification.channel.email' as const)}
            />
            {errors.channel?.email && <Text variant='details' color='red'>* Email Required</Text>}
          </Flex>
          <Flex direction='column' w='100%'>
            <Text variant='details' mb={1} color='black'>CC</Text>
            <Input
              borderRadius={8}
              borderColor='gray.200'
              type='text'
              placeholder='Email1, email2, email3, ...'
              {...register('settings.edit_notification.channel.cc' as const)}
            />
          </Flex>
          <Flex direction='column' w='100%'>
            <Text variant='details' mb={1} color='black'>Recipient Name</Text>
            <Input
              borderRadius={8}
              borderColor='gray.200'
              type='text'
              {...register('settings.edit_notification.channel.recipientName' as const)}
            />
          </Flex>
        </Flex>
      )}
      {(editNotification.channel.type === 'slack' || editNotification.channel.type === 'ms-teams') && (
        <Flex mb={6}>
          <Flex direction='column' w='100%'>
            <Text variant='details' mb={1} color='black'>Webhook URL</Text>
            <Input
              borderRadius={8}
              borderColor={errors.channel?.webhookUrl ? 'red' : 'gray.200'}
              type='text'
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
    </>
  )
}

export default function SettingsNotifications() {
  const { errors }: { errors: SettingFormValidation} = useOutletContext();
  const { setValue, getValues } = useFormContext()
  const [alertSetting, setAlertSetting] = useState<string|undefined>()
  const toast = useToast()
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [selectedNotification, setSelectedNotification] = useState<string|undefined>()
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false)
  const [isEdit, setIsEdit] = useState<boolean>(false)

  const notifications = getValues('settings.notifications')

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
    setIsEdit(true)
    setShowNotificationModal(true)
  }

  const onModalClose = () => {
    setShowDeleteModal(false)
    setIsEdit(false)
    setShowNotificationModal(false)
  }

  const openDeleteModal = (id: string | undefined) => {
    if (id) {
      setSelectedNotification(id)
      setShowDeleteModal(true)
    }
  }

  const deleteNotification = () => {
    axios.delete(`/settings/notifications/${selectedNotification}`)
      .then(() => {
        const newNotifications = notifications.filter((notification: NotificationChannel) => notification.id !== selectedNotification)
        setValue('settings.notifications', newNotifications)
        toast({
          position: 'top',
          description: 'Notification has been removed successfully.',
          status: 'info',
          duration: 2000,
        })
        onModalClose()
        setSelectedNotification(undefined)
      })
  }

  const saveNewNotification = async () => {
    const notification = getValues('settings.new_notification')
    const { data } = await axios.post('/settings/notifications', {
      ...notification,
    })
    const updated = notifications.slice()
    updated.push(data)
    setValue('settings.notifications', updated)
    onModalClose()
    toast({
      position: 'top',
      description: 'New notification has been created successfully.',
      status: 'success',
      duration: 2000,
    })
  }

  const saveEditNotification = async () => {
    const notification = getValues('settings.edit_notification')
    if (notification.id) {
      await axios.put(`/settings/notifications/${notification.id}`, {
        ...notification,
      })
      const idx = notifications.findIndex((n: NotificationChannel) => n.id === notification.id)
      notifications[idx] = notification
      setValue('settings.notifications', notifications)
      onModalClose()
      toast({
        position: 'top',
        description: 'Notification has been updated successfully.',
        status: 'success',
        duration: 2000,
      })
    }
  }

  return (
    <Box width='100%'>
      <Section pt={4} pb={6}>
        <Text variant='title' color='black'>Notify when</Text>
        <RadioGroup mt={6} value={alertSetting} onChange={alertSettingChanged}>
          <Stack direction='column' gap={2}>
            <Flex alignItems='flex-start' width='max-content' as='label' html-for='failCount' cursor='pointer'>
              <Radio mt={2} id="failCount" value='failCount' colorScheme='cyan' _focus={{ boxShadow: 'none' }}></Radio>
              <Flex flexWrap='wrap' alignItems='center'>
                <Text variant='paragraph' whiteSpace='nowrap' mx={3} color='darkgray.100'>Notify when a monitor fails for</Text>
                <Select
                  width={16}
                  disabled={alertSetting !== 'failCount'}
                  borderRadius={8}
                  color='darkgray.100'
                  borderColor='gray.200'
                  size='sm'
                  value={getValues('settings.alert.failCount') || 1}
                  onChange={(e) => setValue('settings.alert.failCount', parseInt(e.target.value))}
                >
                  {Array(10).fill('').map((_, index) => (
                    <option key={index} value={index + 1}>{index + 1}</option>
                  ))}
                </Select>
                <Text variant='paragraph' whiteSpace='nowrap' ml={3} color='darkgray.100'>time(s)</Text>
              </Flex>
            </Flex>
            <Flex alignItems='flex-start' width='max-content' as='label' cursor='pointer' html-for='failTimeMinutes'>
              <Radio mt={2} id='failTimeMinutes' value='failTimeMinutes' colorScheme='cyan' _focus={{ boxShadow: 'none' }}></Radio>
              <Flex flexWrap='wrap' alignItems='center'>
                <Text variant='paragraph' whiteSpace='nowrap' mx={3} color='darkgray.100'>Notify when a monitor fails for</Text>
                <Select
                  width={16}
                  disabled={alertSetting !== 'failTimeMinutes'}
                  borderRadius={8}
                  color='darkgray.100'
                  borderColor='gray.200'
                  size='sm'
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
                <Text variant='paragraph' whiteSpace='nowrap' ml={3} color='darkgray.100'>minutes</Text>
              </Flex>
            </Flex>
          </Stack>
        </RadioGroup>
      </Section>
      <Section pt={4} pb={6} minH={60}>
        <Flex alignItems='center' justifyContent='space-between'>
          <Text variant='title' color='black'>All notifications</Text>
          <Button px={0} variant='unstyled' onClick={() => setShowNotificationModal(true)}>
            <Flex align='center'>
              <Icon
                bg='rgba(24, 119, 242, 0.15)'
                p='0.5'
                width={4}
                height={4}
                mr='2'
                borderRadius='4'
                color='darkblue.100'
                as={FiPlus}
                cursor='pointer'
              />
              <Text variant='text-field' color='darkblue.100'>
                New notification
              </Text>
            </Flex>
          </Button>
        </Flex>
        <Grid templateColumns={{ sm: '1fr', xl: '1fr 1fr' }} gap={4} mt={7}>
          {notifications?.map((notification: NotificationChannel) => (
            <Flex
              borderWidth='1px'
              borderColor={'gray.200'}
              borderStyle='solid'
              borderRadius={8}
              px={4}
              py={2}
              alignItems='center'
              maxW={'600px'}
              key={notification.id}
              gap={2}
            >
              <Flex alignItems='center' gap={2} flex={1}>
                {notification.channel.type === 'slack' && (
                  <Box border='1px solid' borderColor='gray.200' w={8} h={8} bg='white' borderRadius='18' p={1.5}>
                    <Image src={SlackIcon} objectFit='contain'></Image>
                  </Box>
                )}
                {notification.channel.type === 'ms-teams' && (
                  <Box border='1px solid' borderColor='gray.200' w={8} h={8} bg='white' borderRadius='18' p={1.5}>
                    <Image src={MSTeamsIcon} objectFit='contain'></Image>
                  </Box>
                )}
                {notification.channel.type === 'email' && (
                  <Image src={BlueEmailIcon} w={8} h={8} objectFit='contain'></Image>
                )}
                <Text variant='text-field' textOverflow='ellipsis' overflow='hidden' whiteSpace='nowrap' color='gray.300'>
                  {notification.name}
                </Text>
                <Box borderRadius={8} w='2' h='2' bg={notification.isDefaultEnabled ? 'darkblue.100' : 'gray.200'}></Box>
              </Flex>
              <Button
                w={6}
                h={6}
                minW={6}
                borderRadius='4'
                bg='lightgray.100'
                p='0'
                onClick={() => openDeleteModal(notification.id)}
              >
                <Icon color='gray.300' fontSize={'xs'} as={FiTrash2} cursor='pointer' />
              </Button>
              <Button
                w={6}
                h={6}
                minW={6}
                borderRadius='4'
                bg='lightgray.100'
                p='0'
                onClick={() => onSelectNotification(notification)}
              >
                <Icon color='darkgray.100' fontSize={'xs'} as={FiEdit} cursor='pointer' />
              </Button>
            </Flex>
          ))}
        </Grid>
      </Section>
      <Modal isOpen={showDeleteModal} onClose={onModalClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius={16} boxShadow='0px 4px 16px rgba(38, 50, 56, 0.1)'>
          <ModalHeader pb={2}>
            <Text color='black' variant='header'>
              Delete notification?
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text variant='paragraph' color='gray.300'>All related information will be lost, this action is permanent, and cannot be undone.</Text>
          </ModalBody>
          <ModalFooter>
            <PrimaryButton
              label='Delete'
              variant='emphasis'
              color='white'
              mr={3}
              onClick={deleteNotification}
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
      <Modal isOpen={showNotificationModal} onClose={onModalClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius={16} boxShadow='0px 4px 16px rgba(38, 50, 56, 0.1)'>
          <ModalHeader pb={2}>
            <Text color='black' variant='header'>
              {isEdit ? 'Edit notification' : 'Add notification'}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
          {isEdit ? <EditNotification errors={errors.edit_notification} /> : <NewNotification errors={errors.new_notification} />}
          </ModalBody>
          <ModalFooter mt={6}>
            <PrimaryButton
              label='Cancel'
              isOutline
              variant='emphasis'
              color='darkblue.100'
              mr={3}
              onClick={onModalClose}
            ></PrimaryButton>
            <PrimaryButton
              disabled={isEdit ? errors.edit_notification.hasErrors : errors.new_notification.hasErrors}
              label='Save'
              variant='emphasis'
              color='white'
              onClick={isEdit ? saveEditNotification : saveNewNotification}
            ></PrimaryButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
