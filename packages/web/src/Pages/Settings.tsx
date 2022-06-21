import { Flex, Box } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { FiUser, FiShield, FiBell } from 'react-icons/fi'
import { useForm, FormProvider, useFormContext } from "react-hook-form";

import { useAuth } from '../services/FirebaseAuth'
import { Section, Text, PrimaryButton, NavItem } from '../components'

const SIDEBAR_WIDTH = '200px'

const SettingsSidebar = (props: any) => (
  <Box
    as='nav'
    px='4'
    bg='white'
    borderRadius={4}
    w={SIDEBAR_WIDTH}
    h={'calc(100vh - 140px)'}
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

export function Settings() {
  const { userInfo } = useAuth()
  const methods = useForm()
  const [formChanged, setFormChanged] = useState<boolean>(false)
  const { setValue, watch, getValues } = methods

  watch()

  useEffect(() => {
    const subscription = watch(() => {
      setFormChanged(true)
    })
    return () => subscription.unsubscribe()
  }, [watch])

  const resetForm = () => {
    setValue('settings', {
      profile: userInfo,
      security: {
        password: null,
        is_2fa_enabled: false,
        single_sign_on: false,
      },
      new_notification: {
        name: null,
        channel: {
          type: null,
          webhookUrl: null,
          email: null,
          cc: null,
          recipientName: null,
        },
        failCount: null,
        failTimeMS: null,
        default_enabled: null,
        apply_on_existing_monitors: null,
      },
    }, { shouldTouch: true })
    setFormChanged(false)
  }

  useEffect(() => {
    resetForm()
  }, [userInfo])

  const cancelChanges = () => {
    resetForm()
  }

  const saveChanges = () => {
    console.log('------- values', getValues('settings'))
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
