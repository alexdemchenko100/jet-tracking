import { Flex, Box, useToast } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { FiUser, FiShield, FiBell } from 'react-icons/fi'
import { useForm, FormProvider } from "react-hook-form"
import axios from 'axios'
import { NotificationChannel, Settings } from '@httpmon/db'
import { useQuery } from 'react-query'
import { useAuth } from '../services/FirebaseAuth'
import { Section, Text, PrimaryButton, NavItem } from '../components'
import { UserInfo } from '../types/common'
import { SettingFormValidation } from '../types/common'

const SIDEBAR_WIDTH = '200px'

interface SettingsForm {
  [x: string]: any
}

const SettingsSidebar = (props: any) => (
  <Box
    as='nav'
    px='4'
    bg='white'
    borderRadius={4}
    w={SIDEBAR_WIDTH}
    minH={'calc(100vh - 140px)'}
    {...props}
  >
    <Flex direction='column' as='nav' py={4} fontSize='sm' color='gray.600' aria-label='Main Navigation'>
      <NavItem icon={FiUser} to='/console/settings/profile'>
        <Text variant='text-field' color='inherit'>Profile</Text>
      </NavItem>

      <NavItem icon={FiShield} to='/console/settings/security'>
        <Text variant='text-field' color='inherit'>Security</Text>
      </NavItem>
      <NavItem icon={FiBell} to='/console/settings/notifications'>
        <Text variant='text-field' color='inherit'>Notifications</Text>
      </NavItem>
    </Flex>
  </Box>
)

export function SettingsPage() {
  const { userInfo } = useAuth()
  const methods = useForm()
  const [formChanged, setFormChanged] = useState<boolean>(false)
  const [initialForm, setInitialForm] = useState<SettingsForm|undefined>()
  const [hasErrors, setHasErrors] = useState<boolean>(false)
  const { setValue, watch, getValues, handleSubmit } = methods
  const toast = useToast()
  const [errors, setErrors] = useState<SettingFormValidation>({
    new_notification: {},
    edit_notification: {},
  })

  watch()

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && initialForm) {
        if (name !== 'settings.notifications' && name !== 'settings.edit_notification') {
          setFormChanged(JSON.stringify(value.settings) !== JSON.stringify(initialForm))
        } else if (name === 'settings.edit_notification') {
          resetForm(userInfo, userSettings, notifications, value.settings.edit_notification)
        } else if (name === 'settings.notifications') {
          resetForm(userInfo, userSettings, value.settings.notifications)
        }
      }
      let hasErrors = false
      let newNotificationError = {
        name: false,
        channel: {
          type: false,
          email: false,
          webhookUrl: false
        }
      }
      if (value.settings.new_notification.name
        || value.settings.new_notification.channel.type
        || value.settings.new_notification.applyOnExistingMonitors
        || !value.settings.new_notification.isDefaultEnabled
      ) {
        if (!value.settings.new_notification.name) {
          newNotificationError.name = true
          hasErrors = true
        }
        if (!value.settings.new_notification.channel.type) {
          newNotificationError.channel.type = true
          hasErrors = true
        } else {
          if (value.settings.new_notification.channel.type === 'email' && !value.settings.new_notification.channel.email) {
            newNotificationError.channel.email = true
            hasErrors = true
          }
          if (value.settings.new_notification.channel.type !== 'email' && !value.settings.new_notification.channel.webhookUrl) {
            newNotificationError.channel.webhookUrl = true
            hasErrors = true
          }
        }
      }
      // valdiate EditNotification form
      let editNotificationError = {
        name: false,
        channel: {
          type: false,
          email: false,
          webhookUrl: false
        }
      }
      if (value.settings.edit_notification.id) {
        if (!value.settings.edit_notification.name) {
          editNotificationError.name = true
          hasErrors = true
        }
        if (!value.settings.edit_notification.channel.type) {
          editNotificationError.channel.type = true
          hasErrors = true
        } else {
          if (value.settings.edit_notification.channel.type === 'email' && !value.settings.edit_notification.channel.email) {
            editNotificationError.channel.email = true
            hasErrors = true
          }
          if (value.settings.edit_notification.channel.type !== 'email' && !value.settings.edit_notification.channel.webhookUrl) {
            editNotificationError.channel.webhookUrl = true
            hasErrors = true
          }
        }
      }
      setErrors({ ...errors, edit_notification: editNotificationError, new_notification: newNotificationError })
      setHasErrors(hasErrors)
    })
    return () => subscription.unsubscribe()
  }, [watch, initialForm])

  // Fetch settings for current user
  const { data: userSettings } = useQuery(['settings'], async () => {
    const resp = await axios({
      method: 'GET',
      url: '/settings',
    })
    return resp.data
  })

  // Fetch notifications list
  const { data: notifications } = useQuery(['notificaitons'], async () => {
    const resp = await axios({
      method: 'GET',
      url: '/settings/notifications',
    })
    return resp.data
  })

  const resetForm = (profile: UserInfo, settings: Settings, notificationList: NotificationChannel[], editNotification?: NotificationChannel) => {
    const formData = {
      profile: profile,
      security: {
        password: '',
        is_2fa_enabled: false,
        single_sign_on: false,
      },
      new_notification: {
        name: '',
        channel: {},
        isDefaultEnabled: true,
        applyOnExistingMonitors: false,
      },
      edit_notification: editNotification ? editNotification : {
        name: '',
        channel: {},
        isDefaultEnabled: false,
        applyOnExistingMonitors: false,
      },
      notifications: notificationList,
      alert: {
        failCount: settings.alert.failCount,
        failTimeMS: settings.alert.failTimeMS,
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
  }, [userSettings, notifications])

  const cancelChanges = () => {
    resetForm(userInfo, userSettings, notifications)
  }

  const onSubmit = async () => {
    if (hasErrors) {
      toast({
        position: 'top',
        description: 'Please fill all required fields',
        status: 'error',
        duration: 1500,
        isClosable: false,
      })
      return false
    }
    const settings = getValues('settings')
    // Save new notification
    if (settings.new_notification.name && settings.new_notification.channel.type) {
      await axios.post('/settings/notifications', {
        ...settings.new_notification,
      })
    }
    if (settings.edit_notification.id) {
      await axios.put(`/settings/notifications/${settings.edit_notification.id}`, {
        ...settings.edit_notification,
      })
    }
    // Save alert settings
    const userSettings = await axios.put('/settings', {
        alert: settings.alert,
      }).then(resp => resp.data)
    const notifications = await axios({
        method: 'GET',
        url: '/settings/notifications',
      }).then((resp) => resp.data)
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

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Section>
          <Flex alignItems='center' justify={'space-between'}>
            <Text variant='header' color='black'>Settings</Text>
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
                type="submit"
              ></PrimaryButton>
            </Flex>
          </Flex>
        </Section>
        <Flex>
          <SettingsSidebar />
          <Flex flex={1} ml={2} height='fit-content'>
            <Outlet context={{ errors }} />
          </Flex>
        </Flex>
      </form>
    </FormProvider>
  )
}
