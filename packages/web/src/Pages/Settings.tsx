import { Flex, Box, useToast } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { FiUser, FiShield, FiBell, FiUsers } from 'react-icons/fi'
import { useForm, FormProvider } from 'react-hook-form'
import axios from 'axios'
import { NotificationChannel, Settings } from '@httpmon/db'
import { useQuery } from 'react-query'
import { useAuth } from '../services/FirebaseAuth'
import { Section, Text, PrimaryButton, NavItem } from '../components'
import { UserInfo } from '../types/common'
import { SettingFormValidation } from '../types/common'

const SIDEBAR_WIDTH = '240px'

interface SettingsForm {
  [x: string]: any
}

const SettingsSidebar = (props: any) => (
  <Box
    as='nav'
    px='4'
    bg='white'
    borderRadius={4}
    minW={SIDEBAR_WIDTH}
    minH={'calc(100vh - 140px)'}
    {...props}
  >
    <Flex
      direction='column'
      as='nav'
      py={4}
      fontSize='sm'
      color='gray.600'
      aria-label='Main Navigation'
    >
      <NavItem icon={FiUser} to='/console/settings/profile'>
        <Text variant='text-field' color='inherit'>
          Profile
        </Text>
      </NavItem>

      <NavItem icon={FiShield} to='/console/settings/security'>
        <Text variant='text-field' color='inherit'>
          Security
        </Text>
      </NavItem>
      <NavItem icon={FiBell} to='/console/settings/notifications'>
        <Text variant='text-field' color='inherit'>
          Notifications
        </Text>
      </NavItem>
      <NavItem icon={FiUsers} to='/console/settings/users'>
        <Text variant='text-field' color='inherit'>
          User Management
        </Text>
      </NavItem>
    </Flex>
  </Box>
)

export function SettingsPage() {
  const { userInfo } = useAuth()
  const methods = useForm()
  const [formChanged, setFormChanged] = useState<boolean>(false)
  const [initialForm, setInitialForm] = useState<SettingsForm | undefined>()
  const { setValue, watch, getValues, handleSubmit } = methods
  const toast = useToast()
  const [errors, setErrors] = useState<SettingFormValidation>({
    new_notification: { hasErrors: true },
    edit_notification: { hasErrors: false },
  })

  watch()

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && initialForm) {
        if (
          !name.includes('settings.notifications') &&
          !name.includes('settings.edit_notification') &&
          !name.includes('settings.new_notification')
        ) {
          setFormChanged(JSON.stringify(value.settings) !== JSON.stringify(initialForm))
        } else if (name.includes('settings.edit_notification')) {
          resetForm(
            userInfo,
            userSettings,
            value.settings.notifications,
            value.settings.edit_notification
          )
        } else if (name.includes('settings.notifications')) {
          resetForm(userInfo, userSettings, value.settings.notifications)
        } else if (name.includes('settings.new_notification')) {
          resetForm(
            userInfo,
            userSettings,
            value.settings.notifications,
            value.settings.edit_notification,
            value.settings.new_notification
          )
        }
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
        value.settings.new_notification.name ||
        value.settings.new_notification.channel.type ||
        value.settings.new_notification.applyOnExistingMonitors ||
        !value.settings.new_notification.isDefaultEnabled
      ) {
        if (!value.settings.new_notification.name) {
          newNotificationError.name = true
          newNotificationError.hasErrors = true
        }
        if (!value.settings.new_notification.channel.type) {
          newNotificationError.channel.type = true
          newNotificationError.hasErrors = true
        } else {
          if (
            value.settings.new_notification.channel.type === 'email' &&
            !value.settings.new_notification.channel.email
          ) {
            newNotificationError.channel.email = true
            newNotificationError.hasErrors = true
          }
          if (
            value.settings.new_notification.channel.type !== 'email' &&
            !value.settings.new_notification.channel.webhookUrl
          ) {
            newNotificationError.channel.webhookUrl = true
            newNotificationError.hasErrors = true
          }
        }
      }
      if (!value.settings.new_notification.name && !value.settings.new_notification.channel.type) {
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
      if (value.settings.edit_notification.id) {
        if (!value.settings.edit_notification.name) {
          editNotificationError.name = true
          editNotificationError.hasErrors = true
        }
        if (!value.settings.edit_notification.channel.type) {
          editNotificationError.channel.type = true
          editNotificationError.hasErrors = true
        } else {
          if (
            value.settings.edit_notification.channel.type === 'email' &&
            !value.settings.edit_notification.channel.email
          ) {
            editNotificationError.channel.email = true
            editNotificationError.hasErrors = true
          }
          if (
            value.settings.edit_notification.channel.type !== 'email' &&
            !value.settings.edit_notification.channel.webhookUrl
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
  }, [watch, initialForm])

  // Fetch settings for current user
  const { data: userSettings, isFetched: isSettingsFetched } = useQuery(['settings'], async () => {
    const resp = await axios({
      method: 'GET',
      url: '/settings',
    })
    return resp.data
  })

  // Fetch notifications list
  const { data: notifications, isFetched: isNotificationFetched } = useQuery(
    ['notifications'],
    async () => {
      const resp = await axios({
        method: 'GET',
        url: '/settings/notifications',
      })
      return resp.data
    }
  )

  const resetForm = (
    profile: UserInfo,
    settings: Settings,
    notificationList: NotificationChannel[],
    editNotification?: NotificationChannel,
    newNotification?: NotificationChannel
  ) => {
    const formData = {
      profile: profile,
      security: {
        password: '',
        is_2fa_enabled: false,
        single_sign_on: false,
      },
      new_notification: newNotification
        ? newNotification
        : {
            name: '',
            channel: {},
            isDefaultEnabled: true,
            applyOnExistingMonitors: false,
          },
      edit_notification: editNotification
        ? editNotification
        : {
            name: '',
            channel: {},
            isDefaultEnabled: false,
            applyOnExistingMonitors: false,
          },
      notifications: notificationList,
      alert: {
        failCount: settings.alert.failCount,
        failTimeMinutes: settings.alert.failTimeMinutes,
      },
    }
    setInitialForm(formData)
    setValue('settings', formData, { shouldTouch: true })
    setFormChanged(false)
  }

  // Set data when loading finished
  useEffect(() => {
    if (userSettings && notifications) {
      resetForm(userInfo, userSettings, notifications)
    }
  }, [userSettings, notifications, isNotificationFetched, isSettingsFetched])

  const cancelChanges = () => {
    const notifications = getValues('settings.notifications')
    resetForm(userInfo, userSettings, notifications)
  }

  const onSubmit = async () => {
    const settings = getValues('settings')
    // Save alert settings
    const userSettings = await axios
      .put('/settings', {
        alert: settings.alert,
      })
      .then((resp) => resp.data)
    const notifications = getValues('settings.notifications')
    resetForm(userInfo, userSettings, notifications)
    toast({
      position: 'top',
      title: 'Settings Update',
      description: 'Settings has been updated successfully.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
  }

  if (!userSettings || !notifications) return <></>

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete='nope'>
        <Section>
          <Flex alignItems='center' justify={'space-between'}>
            <Text variant='header' color='black'>
              Settings
            </Text>
            <Flex gap={2}>
              <PrimaryButton
                label='Cancel'
                isOutline
                disabled={!formChanged}
                variant='emphasis'
                color={'darkblue.100'}
                onClick={cancelChanges}
              ></PrimaryButton>
              <PrimaryButton
                label='Save'
                disabled={!formChanged}
                variant='emphasis'
                color={'white'}
                type='submit'
              ></PrimaryButton>
            </Flex>
          </Flex>
        </Section>
        <Flex>
          <SettingsSidebar />
          <Flex flex={1} ml={2} height='fit-content' overflow='hidden'>
            <Outlet context={{ errors }} />
          </Flex>
        </Flex>
      </form>
    </FormProvider>
  )
}
