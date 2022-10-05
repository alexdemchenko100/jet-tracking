import { useState } from 'react'
import { Box, FormControl, Switch, FormLabel } from '@chakra-ui/react'
import { FormProvider, useForm } from 'react-hook-form'
import { Section, Text, SettingsHeader } from '../components'

interface SecuritySettingsForm {
  single_sign_on: boolean
  enforce_2fa_for_all: boolean
  advanced_security: boolean
  activity_logs: boolean
}

export default function SettingsSecurity() {
  const methods = useForm<SecuritySettingsForm>({
    defaultValues: {
      single_sign_on: false,
      enforce_2fa_for_all: false,
      advanced_security: false,
      activity_logs: false,
    },
  })
  const { register, reset, handleSubmit, watch } = methods
  const watched = watch()

  const handleCreation = (data: SecuritySettingsForm) => {}

  return (
    <FormProvider {...methods}>
      <Box as='form' w='100%' onSubmit={handleSubmit(handleCreation)}>
        <SettingsHeader title='Security'></SettingsHeader>
        <Box width='100%'>
          <Section pt={4} pb={20}>
            <Text variant='title' color='black'>
              Settings
            </Text>
            <Box mt={6}>
              <FormControl display='flex' alignItems='center'>
                <Switch
                  id='single_sign_on'
                  size='sm'
                  mr={2}
                  isChecked={watched.single_sign_on}
                  {...register(`single_sign_on` as const)}
                />
                <FormLabel htmlFor='single_sign_on' m={0}>
                  <Text variant='text-field' color='black'>
                    Single Sign-On (SSO)
                  </Text>
                </FormLabel>
              </FormControl>
            </Box>
            <Box mt={6}>
              <FormControl display='flex' alignItems='center'>
                <Switch
                  id='all_users_2fa'
                  size='sm'
                  mr={2}
                  isChecked={watched.enforce_2fa_for_all}
                  {...register(`enforce_2fa_for_all` as const)}
                />
                <FormLabel htmlFor='all_users_2fa' m={0}>
                  <Text variant='text-field' color='black'>
                    Enforce 2FA for All Users
                  </Text>
                </FormLabel>
              </FormControl>
            </Box>
            <Box mt={6}>
              <FormControl display='flex' alignItems='center'>
                <Switch
                  id='advanced_security'
                  size='sm'
                  mr={2}
                  isChecked={watched.advanced_security}
                  {...register(`advanced_security` as const)}
                />
                <FormLabel htmlFor='advanced_security' m={0}>
                  <Text variant='text-field' color='black'>
                    Advanced Security Control
                  </Text>
                </FormLabel>
              </FormControl>
            </Box>
            <Box mt={6}>
              <FormControl display='flex' alignItems='center'>
                <Switch
                  id='activity-logs'
                  size='sm'
                  mr={2}
                  isChecked={watched.activity_logs}
                  {...register(`activity_logs` as const)}
                />
                <FormLabel htmlFor='activity-logs' m={0}>
                  <Text variant='text-field' color='black'>
                    Activity Logs
                  </Text>
                </FormLabel>
              </FormControl>
            </Box>
          </Section>
        </Box>
      </Box>
    </FormProvider>
  )
}
