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
import { FormProvider, useForm } from 'react-hook-form'
import axios from 'axios'
import { useQuery } from 'react-query'
import {
  EmailNotificationChannel,
  MSTeamsNotificationChannel,
  NotificationChannel,
  SlackNotificationChannel,
  UserAccount,
} from '@httpmon/db'

import { Section, Text, ChannelSelect, PrimaryButton, SettingsHeader } from '../components'
import { BlueEmailIcon, MSTeamsIcon, SlackIcon } from '../Assets'
import { Store } from '../services/Store'

interface AlertSettingsForm {
  failCount?: number
  failTimeMinutes?: number
  alertSetting: string
}

interface Props {
  notification?: NotificationChannel
  emails: UserAccount[]
  open: boolean
  onClose: () => void
}

type Channel = SlackNotificationChannel | EmailNotificationChannel | MSTeamsNotificationChannel

function NotificationDetailsModal({ emails, notification, open, onClose }: Props) {
  const toast = useToast()
  const methods = useForm<NotificationChannel>({
    defaultValues: {
      name: '',
      channel: {},
      isDefaultEnabled: true,
      applyOnExistingMonitors: false,
    },
  })
  const {
    register,
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = methods
  const watched = watch()

  useEffect(() => {
    if (notification) {
      reset({ ...notification })
    }
  }, [notification])

  const selectChannel = (value: string) => {
    const data = { type: value } as Channel
    setValue('channel', data)
  }

  const saveNotification = async (data: NotificationChannel) => {
    let msg
    if (notification) {
      await axios.put(`/settings/notifications/${notification.id}`, {
        ...data,
      })
      msg = 'Notification has been updated successfully.'
    } else {
      await axios.post('/settings/notifications', {
        ...data,
      })
      msg = 'New notification has been created successfully.'
    }
    toast({
      position: 'top',
      description: msg,
      status: 'success',
      duration: 2000,
    })
    Store.queryClient?.invalidateQueries(['notifications'])
    closeModal()
  }

  const closeModal = () => {
    reset()
    onClose()
  }

  const { channel, isDefaultEnabled, applyOnExistingMonitors } = watched

  return (
    <Modal isOpen={open} onClose={closeModal} isCentered>
      <ModalOverlay />
      <ModalContent borderRadius={16} boxShadow='0px 4px 16px rgba(38, 50, 56, 0.1)'>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(saveNotification)}>
            <ModalHeader pb={2}>
              <Text color='black' variant='header'>
                {notification ? 'Edit channel' : 'Add channel'}
              </Text>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex gap='6' flexWrap='wrap' mt={2} mb={6}>
                <Flex direction='column' w='100%'>
                  <Text variant='details' mb={1} color='black'>
                    Name
                  </Text>
                  <Input
                    borderRadius={8}
                    borderColor={errors.name ? 'red' : 'gray.200'}
                    type='text'
                    {...register('name' as const, { required: true })}
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
                    channel={channel.type}
                    onSelect={selectChannel}
                    hasError={!!errors.channel?.type}
                  />
                  {errors.channel?.type && (
                    <Text variant='details' color='red'>
                      * Channel Required
                    </Text>
                  )}
                </Flex>
              </Flex>
              {channel.type === 'email' && (
                <Flex gap='4' flexWrap='wrap' mb={6}>
                  <Flex direction='column' w='100%'>
                    <Text variant='details' mb={1} color='black'>
                      Email *
                    </Text>
                    <Select borderRadius={8} {...register('channel.email' as const)}>
                      <option disabled>Please select an email</option>
                      {emails.map((notificationEmail) => (
                        <option key={notificationEmail.id} value={notificationEmail.email}>
                          {notificationEmail.email}
                        </option>
                      ))}
                    </Select>
                  </Flex>
                </Flex>
              )}
              {(channel.type === 'slack' || channel.type === 'ms-teams') && (
                <Flex mb={6}>
                  <Flex direction='column' w='100%'>
                    <Text variant='details' mb={1} color='black'>
                      Webhook URL
                    </Text>
                    <Input
                      borderRadius={8}
                      type='text'
                      {...register('channel.webhookUrl' as const, { required: true })}
                    />
                  </Flex>
                </Flex>
              )}
              <Box mt={4}>
                <FormControl display='flex' alignItems='center'>
                  <Switch
                    id='edit-default_enabled'
                    size='sm'
                    mr={2}
                    isChecked={isDefaultEnabled}
                    {...register('isDefaultEnabled' as const)}
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
                    isChecked={applyOnExistingMonitors}
                    {...register('applyOnExistingMonitors' as const)}
                  />
                  <FormLabel htmlFor='edit-apply-on-all' m={0}>
                    <Text variant='text-field' color='black'>
                      Apply on all existing monitors
                    </Text>
                  </FormLabel>
                </FormControl>
              </Box>
            </ModalBody>
            <ModalFooter mt={6}>
              <PrimaryButton
                label='Cancel'
                isOutline
                variant='emphasis'
                color='darkblue.100'
                mr={3}
                onClick={closeModal}
              ></PrimaryButton>
              <PrimaryButton
                disabled={!channel.type}
                label='Save'
                variant='emphasis'
                color='white'
                type='submit'
              ></PrimaryButton>
            </ModalFooter>
          </form>
        </FormProvider>
      </ModalContent>
    </Modal>
  )
}

function NotifySettings() {
  const toast = useToast()

  const methods = useForm<AlertSettingsForm>({
    defaultValues: {
      failCount: 1,
      failTimeMinutes: undefined,
    },
  })
  const { register, reset, handleSubmit, formState, watch, setValue } = methods
  const watched = watch()

  useQuery(['alert-settings'], async () => {
    const resp = await axios({
      method: 'GET',
      url: '/settings',
    })
    const { alert } = resp.data
    reset({
      failCount: alert.failCount || 1,
      failTimeMinutes: alert.failTimeMinutes || 5,
      alertSetting: alert.failCount ? 'failCount' : 'failTimeMinutes',
    })
  })

  const saveAlertSettings = async (data: AlertSettingsForm) => {
    const resp = await axios.put('/settings', {
      alert: {
        failCount: data.alertSetting === 'failCount' ? data.failCount : undefined,
        failTimeMinutes: data.alertSetting === 'failTimeMinutes' ? data.failTimeMinutes : undefined,
      },
    })
    toast({
      position: 'top',
      title: 'Settings Update',
      description: 'Settings has been updated successfully.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
  }

  return (
    <Section pt={4} pb={6}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(saveAlertSettings)}>
          <Flex justifyContent='space-between'>
            <Text variant='title' color='black'>
              Notify when
            </Text>
          </Flex>
          <RadioGroup mt={6} value={watched.alertSetting} defaultValue={watched.alertSetting}>
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
                  {...register(`alertSetting`)}
                ></Radio>
                <Flex flexWrap='wrap' alignItems='center'>
                  <Text variant='paragraph' whiteSpace='nowrap' mx={3} color='darkgray.100'>
                    A monitor fails for
                  </Text>
                  <Select
                    width={16}
                    disabled={watched.alertSetting !== 'failCount'}
                    borderRadius={8}
                    color='darkgray.100'
                    borderColor='gray.200'
                    size='sm'
                    value={watched.failCount}
                    {...register(`failCount` as const, {
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
                  {...register(`alertSetting`)}
                ></Radio>
                <Flex flexWrap='wrap' alignItems='center'>
                  <Text variant='paragraph' whiteSpace='nowrap' mx={3} color='darkgray.100'>
                    A monitor is failing for
                  </Text>
                  <Select
                    width={16}
                    disabled={watched.alertSetting !== 'failTimeMinutes'}
                    borderRadius={8}
                    color='darkgray.100'
                    borderColor='gray.200'
                    size='sm'
                    value={watched.failTimeMinutes}
                    {...register(`failTimeMinutes` as const, {
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
          {formState.isDirty && (
            <Flex justifyContent='flex-end' gap={2}>
              <PrimaryButton
                label='Cancel'
                isOutline
                variant='emphasis'
                color={'darkblue.100'}
                onClick={() => reset()}
              ></PrimaryButton>
              <PrimaryButton
                label='Save'
                variant='emphasis'
                color={'white'}
                type='submit'
              ></PrimaryButton>
            </Flex>
          )}
        </form>
      </FormProvider>
    </Section>
  )
}

export default function SettingsNotifications() {
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [selectedNotification, setSelectedNotification] = useState<
    NotificationChannel | undefined
  >()

  const { data: notifications } = useQuery<NotificationChannel[]>(['notifications'], async () => {
    const resp = await axios({
      method: 'GET',
      url: '/settings/notifications',
    })
    return resp.data
  })

  const { data: notificationEmails } = useQuery(['verifiedNotificaitonEmails'], async () => {
    const resp = await axios({
      method: 'GET',
      url: '/team',
    })
    const accounts = resp.data as UserAccount[]
    return accounts.filter((acct) => acct.isVerified)
  })

  const onSelectNotification = (notification: NotificationChannel) => {
    setSelectedNotification(notification)
    setModalOpen(true)
  }

  const onModalClose = () => {
    setShowDeleteModal(false)
    setModalOpen(false)
    setSelectedNotification(undefined)
  }

  const openDeleteModal = (notification: NotificationChannel) => {
    if (notification) {
      setSelectedNotification(notification)
      setShowDeleteModal(true)
    }
  }

  const deleteNotification = async () => {
    await axios.delete(`/settings/notifications/${selectedNotification?.id}`)
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

  return (
    <>
      <SettingsHeader title='Notifications'></SettingsHeader>
      <Box w='100%'>
        <Box width='100%'>
          <NotifySettings />
          {/* Notifications */}
          <Section pt={4} pb={6} minH={60}>
            <Flex alignItems='center' justifyContent='space-between'>
              <Text variant='title' color='black'>
                All notification channels
              </Text>
              <Button px={0} variant='unstyled' onClick={() => setModalOpen(true)}>
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
                    onClick={() => openDeleteModal(notification)}
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
          <NotificationDetailsModal
            key={selectedNotification?.id}
            emails={notificationEmails || []}
            notification={selectedNotification}
            open={modalOpen}
            onClose={onModalClose}
          />
        </Box>
      </Box>
    </>
  )
}
