import {
  Box,
  Avatar,
  Flex,
  Input,
  FlexProps,
  FormControl,
  Switch,
  FormLabel,
  Image,
  Spacer,
  useToast,
} from '@chakra-ui/react'
import React, { useState, useRef } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { Section, SettingsHeader, Text, InputField } from '../components'
import { googleIcon } from '../Assets'
import { useAuth } from '../services/FirebaseAuth'

interface ProfileSettingsForm {
  is_2fa_enabled: boolean
  password: string
  displayName: string
  phoneNumber: string
}

export default function SettingsProfile() {
  const { userInfo: user } = useAuth()
  const toast = useToast()

  const methods = useForm<ProfileSettingsForm>({
    defaultValues: {
      displayName: '',
      is_2fa_enabled: false,
      password: '',
      phoneNumber: '',
    },
  })

  const { register, reset, handleSubmit, watch } = methods
  const watched = watch()

  const [profileImage, setProfileImage] = useState<string | undefined>()
  const inputRef = useRef<HTMLInputElement>(null)

  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      let image = URL.createObjectURL(event.target.files[0])
      setProfileImage(image)
    }
  }

  const handleCreation = (data: ProfileSettingsForm) => {
    let hasErrors, errorMessage
    if (!data.displayName) {
      hasErrors = true
      errorMessage = 'Name is required.'
    }
    if (!data.phoneNumber) {
      hasErrors = true
      errorMessage = 'Phone number is required.'
    }
    if (hasErrors) {
      toast({
        position: 'top',
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
      return
    }
    // Todo: Call Profile Update API.
  }

  if (!user) {
    return <>Loading...</>
  }

  return (
    <FormProvider {...methods}>
      <Box as='form' w='100%' onSubmit={handleSubmit(handleCreation)}>
        <SettingsHeader resetForm={() => reset()}></SettingsHeader>
        <Flex direction='column' width='100%'>
          <Section pt={4} pb={16}>
            <Text variant='title' color='black'>
              Profile
            </Text>
            <Flex direction='column' py={6} gap={4} borderBottom='1px solid' borderColor='gray.200'>
              <Text variant='text-field' color='darkgray.100'>
                Provider that you use to log in to Proautoma
              </Text>
              <Flex
                maxW='450px'
                p={4}
                borderRadius={8}
                border='1px solid'
                borderColor='gray.200'
                gap={2}
              >
                <Image
                  src={googleIcon}
                  w={10}
                  h={10}
                  p={1}
                  borderRadius={24}
                  border='1px solid'
                  borderColor='gray.200'
                />
                <Flex direction='column' gap={1}>
                  <Text cursor='pointer' variant='text-field' color='black'>
                    Google
                  </Text>
                  <Text cursor='pointer' variant='paragraph' color='gray.300'>
                    example@mail.com
                  </Text>
                </Flex>
                <Spacer></Spacer>
                <Text cursor='pointer' variant='text-field' color='darkblue.100'>
                  Disconnect
                </Text>
              </Flex>
            </Flex>
            <Flex alignItems='center' py={6} gap={6}>
              <Avatar
                size='xl'
                name={user.displayName || user.email || ''}
                src={profileImage || user.photoURL}
                cursor='pointer'
              />
              <input
                type='file'
                accept='image/*'
                ref={inputRef}
                style={{ display: 'none' }}
                onChange={onImageChange}
              ></input>
              <Text
                variant='text-field'
                cursor='pointer'
                color='darkblue.100'
                onClick={() => inputRef.current?.click()}
              >
                Upload your photo
              </Text>
            </Flex>
            <Flex gap={4} flexWrap='wrap'>
              <InputField>
                <Text variant='details' color='black' mb={1}>
                  Full name
                </Text>
                <Input
                  placeholder='Name'
                  type='text'
                  textTransform='capitalize'
                  {...register(`displayName` as const)}
                />
              </InputField>
              <InputField>
                <Text variant='details' color='black' mb={1}>
                  Email
                </Text>
                <Input placeholder='Email' value={user.email} disabled />
              </InputField>
              <InputField>
                <Text variant='details' color='black' mb={1}>
                  Phone
                </Text>
                <Input placeholder='Phone' type='number' {...register(`phoneNumber` as const)} />
              </InputField>
            </Flex>
          </Section>
          <Section pt={4} pb={6}>
            <Text pt={2} variant='title' color='black'>
              Password
            </Text>
            <Box
              mt={6}
              pb={4}
              borderBottomColor='lightgray.100'
              borderBottomWidth='1px'
              borderStyle='solid'
            >
              <InputField>
                <Text variant='details' color='black' mb={1}>
                  Password
                </Text>
                <Input
                  placeholder='Password'
                  autoComplete='new-password'
                  type='password'
                  {...register(`password` as const)}
                />
                <Text variant='details' mt={2} color='darkblue.100' cursor='pointer'>
                  Change password
                </Text>
              </InputField>
            </Box>
            <Box mt={6}>
              <FormControl display='flex' alignItems='center'>
                <Switch
                  id='2fa'
                  size='sm'
                  mr={2}
                  isChecked={watched.is_2fa_enabled}
                  colorScheme='cyan'
                  {...register(`is_2fa_enabled` as const)}
                />
                <FormLabel htmlFor='2fa' m={0}>
                  <Text variant='text-field' color='black'>
                    Two-Factor Authentication
                  </Text>
                </FormLabel>
              </FormControl>
            </Box>
          </Section>
        </Flex>
      </Box>
    </FormProvider>
  )
}
