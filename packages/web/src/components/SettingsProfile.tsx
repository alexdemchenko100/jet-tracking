import {
  Box,
  Avatar,
  Flex,
  Input,
  FlexProps,
} from '@chakra-ui/react'
import { useFormContext } from 'react-hook-form'

import { Section, Text } from '../components'

const InputField = ({ children }: FlexProps) => (
  <Flex flexDirection={'column'} borderRadius='8' borderColor='gray.200' width='100%' maxW={96}>
    {children}
  </Flex>
)

export default function SettingsProfile() {
  const { getValues, register } = useFormContext()
  const user = getValues('settings.profile')

  if (!user) {
    return <>Loading...</>
  }

  return (
    <Section pt={4} pb={16} width='100%'>
      <Text variant='title' color='black'>Profile</Text>
      <Box py={10}>
        <Avatar
          size='xl'
          name={user.displayName || user.email || ''}
          src={user.photoURL}
          cursor='pointer'
        />
      </Box>
      <Flex gap={4} flexWrap='wrap'>
        <InputField>
          <Text variant='details' color='black' mb={1}>Full name</Text>
          <Input placeholder='Name' type='text' textTransform='capitalize' {...register(`settings.profile.displayName` as const)} />
        </InputField>
        <InputField>
          <Text variant='details' color='black' mb={1}>Email</Text>
          <Input placeholder='Email' value={user.email} disabled />
        </InputField>
        <InputField>
          <Text variant='details' color='black' mb={1}>Phone</Text>
          <Input placeholder='Phone' type='number' {...register(`settings.profile.phoneNumber` as const)} />
        </InputField>
      </Flex>
    </Section>
  )
}
