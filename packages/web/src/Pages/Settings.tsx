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

const SIDEBAR_WIDTH = '200px'

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
  const { setValue, watch, getValues } = methods
  const toast = useToast()

  watch()

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      console.log('form value: ', value)
      if (name !== 'settings.edit_notification') {
        setFormChanged(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

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

  const resetForm = (profile: UserInfo, settings: Settings, notificationList: NotificationChannel[]) => {
    setValue('settings', {
      profile: profile,
      security: {
        password: null,
        is_2fa_enabled: false,
        single_sign_on: false,
      },
      new_notification: {
        name: null,
        channel: {},
        isDefaultEnabled: false,
        applyOnExistingMonitors: false,
      },
      edit_notification: {
        name: null,
        channel: {},
        isDefaultEnabled: false,
        applyOnExistingMonitors: false,
      },
      notifications: notificationList,
      alert: settings ? settings.alert : {},
    }, { shouldTouch: true })
    setFormChanged(false)
  }

  // Set data when loading finished
  useEffect(() => {
    resetForm(userInfo, userSettings, notifications)
  }, [userSettings, notifications])

  const cancelChanges = () => {
    resetForm(userInfo, userSettings, notifications)
  }

  const saveChanges = async () => {
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
              onClick={saveChanges}
            ></PrimaryButton>
          </Flex>
        </Flex>
      </Section>
      <Flex>
        <SettingsSidebar />
        <Flex flex={1} ml={2} height='fit-content'>
          <Outlet />
        </Flex>
      </Flex>
    </FormProvider>
  )
}
