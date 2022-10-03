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
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import axios from 'axios'
import { useQuery } from 'react-query'
import { NotificationChannel, UserAccount } from '@httpmon/db'

import { Section, Text, ChannelSelect, PrimaryButton, SettingsHeader } from '../components'
import { BlueEmailIcon, MSTeamsIcon, SlackIcon } from '../Assets'
import { Store } from '../services/Store'
import { NotificationFormErrors, SettingFormValidation } from '../types/common'

interface NotificationSettingsForm {
  alert: {
    failCount?: number
    failTimeMinutes?: number
  }
  new_notification: NotificationChannel
  edit_notification: NotificationChannel
}

interface Props {
  errors: NotificationFormErrors
  emails: UserAccount[]
}

function NewNotification({ errors, emails }: Props) {
  const { register, setValue, watch, getValues } = useFormContext()

  const newNotification = watch('new_notification')

  const selectChannel = (value: string) => {
    setValue('new_notification.channel', { type: value })
  }

  return (
    <>
      <Flex gap='6' flexWrap='wrap' mt={2} mb={6}>
        <Flex direction='column' w='100%'>
          <Text variant='details' mb={1} color='black'>
            Name
          </Text>
          <Input
            borderRadius={8}
            borderColor={errors.name ? 'red' : 'gray.200'}
            type='text'
            {...register('new_notification.name' as const)}
          />
          {errors.name && (
            <Text variant='details' color='red'>
              * Name Required
            </Text>
          )}
        </Flex>
        <Flex direction='column' w='100%'>
          <Text variant='details' mb={1} color='black'>
            Type
          </Text>
          <ChannelSelect
            channel={newNotification.channel?.type}
            onSelect={selectChannel}
            hasError={errors.channel?.type || false}
          />
          {errors.channel?.type && (
            <Text variant='details' color='red'>
              * Channel Required
            </Text>
          )}
        </Flex>
      </Flex>
      {newNotification.channel.type === 'email' && (
        <Flex gap='4' flexWrap='wrap' mb={6}>
          <Flex direction='column' w='100%'>
            <Text variant='details' mb={1} color='black'>
              Email *
            </Text>
            <Select
              borderRadius={8}
              borderColor={errors.channel?.email ? 'red' : 'gray.200'}
              {...register('new_notification.channel.email' as const)}
            >
              <option value=''>Please select an email</option>
              {emails.map((notificationEmail) => (
                <option key={notificationEmail.id} value={notificationEmail.email}>
                  {notificationEmail.email}
                </option>
              ))}
            </Select>
            {errors.channel?.email && (
              <Text variant='details' color='red'>
                * Email Required
              </Text>
            )}
          </Flex>
        </Flex>
      )}
      {(newNotification.channel.type === 'slack' ||
        newNotification.channel.type === 'ms-teams') && (
        <Flex mb={6}>
          <Flex direction='column' w='100%'>
            <Text variant='details' mb={1} color='black'>
              Webhook URL
            </Text>
            <Input
              borderRadius={8}
              borderColor={errors.channel?.webhookUrl ? 'red' : 'gray.200'}
              type='text'
              {...register('new_notification.channel.webhookUrl' as const)}
            />
            {errors.channel?.webhookUrl && (
              <Text variant='details' color='red'>
                * Webhook URL Required
              </Text>
            )}
          </Flex>
        </Flex>
      )}
      <Box mt={4}>
        <FormControl display='flex' alignItems='center'>
          <Switch
            id='default_enabled'
            size='sm'
            mr={2}
            isChecked={getValues('new_notification.isDefaultEnabled')}
            {...register('new_notification.isDefaultEnabled' as const)}
          />
          <FormLabel htmlFor='default_enabled' m={0}>
            <Text variant='text-field' color='black'>
              Default enabled
            </Text>
          </FormLabel>
        </FormControl>
      </Box>
      <Box mt={4}>
        <FormControl display='flex' alignItems='center'>
          <Switch
            id='apply-on-all'
            size='sm'
            mr={2}
            isChecked={getValues('new_notification.applyOnExistingMonitors')}
            {...register('new_notification.applyOnExistingMonitors' as const)}
          />
          <FormLabel htmlFor='apply-on-all' m={0}>
            <Text variant='text-field' color='black'>
              Apply on all existing monitors
            </Text>
          </FormLabel>
        </FormControl>
      </Box>
    </>
  )
}

function EditNotification({ errors, emails }: Props) {
  const { register, setValue, watch, getValues } = useFormContext()

  const editNotification = watch('edit_notification')

  const selectChannel = (value: string) => {
    setValue('edit_notification', {
      channel: {
        type: value,
        email: null,
        webhookUrl: null,
      },
    })
  }

  return (
    <>
      <Flex gap='6' flexWrap='wrap' mt={2} mb={6}>
        <Flex direction='column' w='100%'>
          <Text variant='details' mb={1} color='black'>
            Name
          </Text>
          <Input
            borderRadius={8}
            borderColor={errors.name ? 'red' : 'gray.200'}
            type='text'
            {...register('edit_notification.name' as const)}
          />
          {errors.name && (
            <Text variant='details' color='red'>
              * Name Required
            </Text>
          )}
        </Flex>
        <Flex direction='column' w='100%'>
          <Text variant='details' mb={1} color='black'>
            Type
          </Text>
          <ChannelSelect
            channel={editNotification.channel.type}
            onSelect={selectChannel}
            hasError={errors.channel?.type || false}
          />
          {errors.channel?.type && (
            <Text variant='details' color='red'>
              * Channel Required
            </Text>
          )}
        </Flex>
      </Flex>
      {editNotification.channel.type === 'email' && (
        <Flex gap='4' flexWrap='wrap' mb={6}>
          <Flex direction='column' w='100%'>
            <Text variant='details' mb={1} color='black'>
              Email *
            </Text>
            <Select
              borderRadius={8}
              borderColor={errors.channel?.email ? 'red' : 'gray.200'}
              {...register('new_notification.channel.email' as const)}
            >
              <option disabled>Please select an email</option>
              {emails.map((notificationEmail) => (
                <option key={notificationEmail.id} value={notificationEmail.email}>
                  {notificationEmail.email}
                </option>
              ))}
            </Select>
            {errors.channel?.email && (
              <Text variant='details' color='red'>
                * Email Required
              </Text>
            )}
          </Flex>
        </Flex>
      )}
      {(editNotification.channel.type === 'slack' ||
        editNotification.channel.type === 'ms-teams') && (
        <Flex mb={6}>
          <Flex direction='column' w='100%'>
            <Text variant='details' mb={1} color='black'>
              Webhook URL
            </Text>
            <Input
              borderRadius={8}
              borderColor={errors.channel?.webhookUrl ? 'red' : 'gray.200'}
              type='text'
              {...register('edit_notification.channel.webhookUrl' as const)}
            />
            {errors.channel?.webhookUrl && (
              <Text variant='details' color='red'>
                * Webhook URL Required
              </Text>
            )}
          </Flex>
        </Flex>
      )}
      <Box mt={4}>
        <FormControl display='flex' alignItems='center'>
          <Switch
            id='edit-default_enabled'
            size='sm'
            mr={2}
            isChecked={getValues('edit_notification.isDefaultEnabled')}
            {...register('edit_notification.isDefaultEnabled' as const)}
          />
          <FormLabel htmlFor='edit-default_enabled' m={0}>
            <Text variant='text-field' color='black'>
              Default enabled
            </Text>
          </FormLabel>
        </FormControl>
      </Box>
      <Box mt={4}>
        <FormControl display='flex' alignItems='center'>
          <Switch
            id='edit-apply-on-all'
            size='sm'
            mr={2}
            isChecked={getValues('edit_notification.applyOnExistingMonitors')}
            {...register('edit_notification.applyOnExistingMonitors' as const)}
          />
          <FormLabel htmlFor='edit-apply-on-all' m={0}>
            <Text variant='text-field' color='black'>
              Apply on all existing monitors
            </Text>
          </FormLabel>
        </FormControl>
      </Box>
    </>
  )
}

export default function SettingsNotifications() {
  const toast = useToast()

  const methods = useForm<NotificationSettingsForm>({
    defaultValues: {
      alert: {
        failCount: 1,
        failTimeMinutes: undefined,
      },
      new_notification: {
        name: '',
        channel: {},
        isDefaultEnabled: true,
        applyOnExistingMonitors: false,
      },
      edit_notification: {
        name: '',
        channel: {},
        isDefaultEnabled: false,
        applyOnExistingMonitors: false,
      },
    },
  })
  const { register, reset, handleSubmit, watch, setValue } = methods
  const watched = watch()

  const [alertSetting, setAlertSetting] = useState<string | undefined>()
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [selectedNotification, setSelectedNotification] = useState<string | undefined>()
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false)
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [errors, setErrors] = useState<SettingFormValidation>({
    new_notification: { hasErrors: false },
    edit_notification: { hasErrors: false },
  })

  const { data: notifications } = useQuery<NotificationChannel[]>(['notifications'], async () => {
    const resp = await axios({
      method: 'GET',
      url: '/settings/notifications',
    })
    return resp.data
  })

  useQuery(['alert-settings'], async () => {
    const resp = await axios({
      method: 'GET',
      url: '/settings',
    })
    reset({
      alert: resp.data.alert,
      new_notification: {
        name: '',
        channel: {},
        isDefaultEnabled: true,
        applyOnExistingMonitors: false,
      },
      edit_notification: {
        name: '',
        channel: {},
        isDefaultEnabled: false,
        applyOnExistingMonitors: false,
      },
    })
  })

  const { data: notificationEmails } = useQuery(['verifiedNotificaitonEmails'], async () => {
    const resp = await axios({
      method: 'GET',
      url: '/team',
    })
    const accounts = resp.data as UserAccount[]
    return accounts.filter((acct) => acct.isVerified)
  })

  useEffect(() => {
    const subscription = watch((value) => {
      if (!value.alert?.failCount) {
        setAlertSetting('failTimeMinutes')
      }
      if (!value.alert?.failTimeMinutes) {
        setAlertSetting('failCount')
      }
      let newNotificationError = {
        hasErrors: false,
        name: false,
        channel: {
          type: false,
          email: false,
          webhookUrl: false,
        },
      }
      if (
        value.new_notification?.name ||
        value.new_notification?.channel?.type ||
        value.new_notification?.applyOnExistingMonitors ||
        !value.new_notification?.isDefaultEnabled
      ) {
        if (!value.new_notification?.name) {
          newNotificationError.name = true
          newNotificationError.hasErrors = true
        }
        if (!value.new_notification?.channel?.type) {
          newNotificationError.channel.type = true
          newNotificationError.hasErrors = true
        } else {
          if (
            value.new_notification?.channel?.type === 'email' &&
            !value.new_notification.channel.email
          ) {
            newNotificationError.channel.email = true
            newNotificationError.hasErrors = true
          }
          if (
            (value.new_notification?.channel?.type === 'ms-teams' ||
              value.new_notification?.channel?.type === 'slack') &&
            !value.new_notification?.channel?.webhookUrl
          ) {
            newNotificationError.channel.webhookUrl = true
            newNotificationError.hasErrors = true
          }
        }
      }
      if (!value.new_notification?.name && !value.new_notification?.channel?.type) {
        newNotificationError.hasErrors = true
      }
      // valdiate EditNotification form
      let editNotificationError = {
        hasErrors: false,
        name: false,
        channel: {
          type: false,
          email: false,
          webhookUrl: false,
        },
      }
      if (value.edit_notification?.id) {
        if (!value.edit_notification.name) {
          editNotificationError.name = true
          editNotificationError.hasErrors = true
        }
        if (!value.edit_notification?.channel?.type) {
          editNotificationError.channel.type = true
          editNotificationError.hasErrors = true
        } else {
          if (
            value.edit_notification?.channel?.type === 'email' &&
            !value.edit_notification?.channel?.email
          ) {
            editNotificationError.channel.email = true
            editNotificationError.hasErrors = true
          }
          if (
            (value.edit_notification?.channel?.type === 'ms-teams' ||
              value.edit_notification?.channel?.type === 'slack') &&
            !value.edit_notification?.channel?.webhookUrl
          ) {
            editNotificationError.channel.webhookUrl = true
            editNotificationError.hasErrors = true
          }
        }
      }
      setErrors({
        edit_notification: editNotificationError,
        new_notification: newNotificationError,
      })
    })
    return () => subscription.unsubscribe()
  }, [watch])

  const alertSettingChanged = (value: string) => {
    setAlertSetting(value)
    setValue('alert', {
      failCount: value === 'failCount' ? 1 : undefined,
      failTimeMinutes: value === 'failTimeMinutes' ? 5 : undefined,
    })
  }

  const onSelectNotification = (notification: NotificationChannel) => {
    setSelectedNotification(notification?.id)
    setValue('edit_notification', notification)
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

  const deleteNotification = async () => {
    await axios.delete(`/settings/notifications/${selectedNotification}`)
    toast({
      position: 'top',
      description: 'Notification has been removed successfully.',
      status: 'info',
      duration: 2000,
    })
    onModalClose()
    Store.queryClient?.invalidateQueries(['notifications'])
    setSelectedNotification(undefined)
  }

  const saveNewNotification = async () => {
    await axios.post('/settings/notifications', {
      ...watched.new_notification,
    })
    onModalClose()
    toast({
      position: 'top',
      description: 'New notification has been created successfully.',
      status: 'success',
      duration: 2000,
    })
    Store.queryClient?.invalidateQueries(['notifications'])
  }

  const saveEditNotification = async () => {
    if (isEdit && selectedNotification) {
      await axios.put(`/settings/notifications/${selectedNotification}`, {
        ...watched.edit_notification,
      })
      onModalClose()
      toast({
        position: 'top',
        description: 'Notification has been updated successfully.',
        status: 'success',
        duration: 2000,
      })
      Store.queryClient?.invalidateQueries(['notifications'])
    }
  }

  const handleCreation = async (data: NotificationSettingsForm) => {
    // Save alert settings
    const resp = await axios.put('/settings', {
      alert: data.alert,
    })
    toast({
      position: 'top',
      title: 'Settings Update',
      description: 'Settings has been updated successfully.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
    reset({
      alert: resp.data.alert,
      new_notification: {
        name: '',
        channel: {},
        isDefaultEnabled: true,
        applyOnExistingMonitors: false,
      },
      edit_notification: {
        name: '',
        channel: {},
        isDefaultEnabled: false,
        applyOnExistingMonitors: false,
      },
    })
  }

  return (
    <FormProvider {...methods}>
      <Box as='form' w='100%' onSubmit={handleSubmit(handleCreation)}>
        <SettingsHeader resetForm={() => reset()}></SettingsHeader>
        <Box width='100%'>
          <Section pt={4} pb={6}>
            <Text variant='title' color='black'>
              Notify when
            </Text>
            <RadioGroup mt={6} value={alertSetting} onChange={alertSettingChanged}>
              <Stack direction='column' gap={2}>
                <Flex
                  alignItems='flex-start'
                  width='max-content'
                  as='label'
                  html-for='failCount'
                  cursor='pointer'
                >
                  <Radio
                    mt={2}
                    id='failCount'
                    value='failCount'
                    colorScheme='cyan'
                    _focus={{ boxShadow: 'none' }}
                  ></Radio>
                  <Flex flexWrap='wrap' alignItems='center'>
                    <Text variant='paragraph' whiteSpace='nowrap' mx={3} color='darkgray.100'>
                      A monitor fails for
                    </Text>
                    <Select
                      width={16}
                      disabled={alertSetting !== 'failCount'}
                      borderRadius={8}
                      color='darkgray.100'
                      borderColor='gray.200'
                      size='sm'
                      value={watched.alert.failCount || 1}
                      {...register(`alert.failCount` as const, {
                        valueAsNumber: true,
                      })}
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
                </Flex>
                <Flex
                  alignItems='flex-start'
                  width='max-content'
                  as='label'
                  cursor='pointer'
                  html-for='failTimeMinutes'
                >
                  <Radio
                    mt={2}
                    id='failTimeMinutes'
                    value='failTimeMinutes'
                    colorScheme='cyan'
                    _focus={{ boxShadow: 'none' }}
                  ></Radio>
                  <Flex flexWrap='wrap' alignItems='center'>
                    <Text variant='paragraph' whiteSpace='nowrap' mx={3} color='darkgray.100'>
                      A monitor is failing for
                    </Text>
                    <Select
                      width={16}
                      disabled={alertSetting !== 'failTimeMinutes'}
                      borderRadius={8}
                      color='darkgray.100'
                      borderColor='gray.200'
                      size='sm'
                      value={watched.alert.failTimeMinutes ?? 5}
                      {...register(`alert.failTimeMinutes` as const, {
                        valueAsNumber: true,
                      })}
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
                </Flex>
              </Stack>
            </RadioGroup>
          </Section>
          {/* Notifications */}
          <Section pt={4} pb={6} minH={60}>
            <Flex alignItems='center' justifyContent='space-between'>
              <Text variant='title' color='black'>
                All notification channels
              </Text>
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
                    New notification channel
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
                    {notification.channel.type === 'ms-teams' && (
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
                    {notification.channel.type === 'email' && (
                      <Image src={BlueEmailIcon} w={8} h={8} objectFit='contain'></Image>
                    )}
                    <Text
                      variant='text-field'
                      textOverflow='ellipsis'
                      overflow='hidden'
                      whiteSpace='nowrap'
                      color='gray.300'
                    >
                      {notification.name}
                    </Text>
                    <Box
                      borderRadius={8}
                      w='2'
                      h='2'
                      bg={notification.isDefaultEnabled ? 'darkblue.100' : 'gray.200'}
                    ></Box>
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
                  Delete channel?
                </Text>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text variant='paragraph' color='gray.300'>
                  All related information will be lost, this action is permanent, and cannot be
                  undone.
                </Text>
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
                  {isEdit ? 'Edit channel' : 'Add channel'}
                </Text>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {isEdit ? (
                  <EditNotification
                    errors={errors.edit_notification}
                    emails={notificationEmails || []}
                  />
                ) : (
                  <NewNotification
                    errors={errors.new_notification}
                    emails={notificationEmails || []}
                  />
                )}
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
                  disabled={
                    isEdit ? errors.edit_notification.hasErrors : errors.new_notification.hasErrors
                  }
                  label='Save'
                  variant='emphasis'
                  color='white'
                  onClick={isEdit ? saveEditNotification : saveNewNotification}
                ></PrimaryButton>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      </Box>
    </FormProvider>
  )
}
