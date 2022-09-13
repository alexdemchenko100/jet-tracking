import {
  Box,
  Avatar,
  Flex,
  Input,
  FormControl,
  Switch,
  FormLabel,
  useToast,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Link as ChakraLink,
} from '@chakra-ui/react'
import React, { useState, useRef } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import axios, { AxiosError } from 'axios'
import { Link } from 'react-router-dom'

import { Section, SettingsHeader, Text, InputField, Loading, PrimaryButton } from '../components'
import { useAuth, changePassword } from '../services/FirebaseAuth'
import { Store } from '../services/Store'
import { FirebaseError } from 'firebase/app'

interface ProfileSettingsForm {
  is_2fa_enabled: boolean
  password: string
  displayName: string
  phoneNumber: string
  oldPassword: string
  confirmPassword: string
}

export default function SettingsProfile() {
  const { userInfo: user } = useAuth()
  const toast = useToast()
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false)

  const methods = useForm<ProfileSettingsForm>({
    defaultValues: {
      displayName: user.displayName,
      is_2fa_enabled: false,
      password: '',
      phoneNumber: user.phoneNumber?.replace('+', '') || '',
    },
  })

  const { register, reset, handleSubmit, watch } = methods
  const watched = watch()
  const { password, oldPassword, confirmPassword } = watched

  const [profileImage, setProfileImage] = useState<string | undefined>()
  const inputRef = useRef<HTMLInputElement>(null)

  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      let image = URL.createObjectURL(event.target.files[0])
      setProfileImage(image)
    }
  }

  const handleCreation = async (data: ProfileSettingsForm) => {
    let hasErrors, errorMessage
    if (!data.displayName) {
      hasErrors = true
      errorMessage = 'Name is required.'
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
    await axios
      .put(`/team/${user.uid}`, {
        displayName: data.displayName,
        phoneNumber: data.phoneNumber ? `+${data.phoneNumber}` : undefined,
      })
      .then(() => {
        toast({
          position: 'top',
          description: 'Your profile has been updated successfully.',
          status: 'info',
          duration: 2000,
          isClosable: false,
        })
        Store.UserState.userInfo.displayName = data.displayName
        if (data.phoneNumber) Store.UserState.userInfo.phoneNumber = data.phoneNumber
        reset({ displayName: data.displayName, phoneNumber: data.phoneNumber })
      })
      .catch((error: AxiosError) => {
        toast({
          position: 'top',
          description: error.response?.data.message,
          status: 'error',
          duration: 2000,
        })
      })
  }

  const updatePassword = async () => {
    if (confirmPassword !== password) {
      toast({
        position: 'top',
        description: "New password and Confirm password don't match.",
        status: 'error',
        duration: 2000,
      })
      return
    }
    try {
      await changePassword(oldPassword, password)
      toast({
        position: 'top',
        description: 'Password has been updated successfully.',
        status: 'info',
        duration: 2000,
        isClosable: false,
      })
      onModalClose()
    } catch (error) {
      const message = (error as FirebaseError).message
      toast({
        position: 'top',
        description: message,
        status: 'error',
        duration: 2000,
      })
      onModalClose()
    }
  }

  const onModalClose = () => {
    setShowPasswordModal(false)
    reset({ password: '', confirmPassword: '', oldPassword: '' })
  }

  if (!user) {
    return <Loading />
  }

  const isGoogleProvider = user.provider === 'google.com'

  return (
    <FormProvider {...methods}>
      <Box as='form' w='100%' onSubmit={handleSubmit(handleCreation)}>
        <SettingsHeader resetForm={() => reset()}></SettingsHeader>
        <Flex direction='column' width='100%'>
          <Section pt={4} pb={16}>
            <Text variant='title' color='black'>
              Profile
            </Text>
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
              <Button
                variant='link'
                disabled={isGoogleProvider}
                onClick={() => inputRef.current?.click()}
              >
                <Text variant='text-field' cursor='pointer' color='darkblue.100'>
                  Upload your photo
                </Text>
              </Button>
            </Flex>
            <Flex gap={4} flexWrap='wrap'>
              <InputField>
                <Text variant='details' color='black' mb={1}>
                  Full name
                </Text>
                <Input
                  disabled={isGoogleProvider}
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
                <Box position='relative'>
                  <Input
                    disabled={isGoogleProvider}
                    paddingLeft='7'
                    placeholder='Phone'
                    type='number'
                    {...register(`phoneNumber` as const)}
                  />
                  <Box position='absolute' color='gray.400' left='2' top='1px' fontSize='24'>
                    +
                  </Box>
                </Box>
              </InputField>
            </Flex>
          </Section>
          {!isGoogleProvider && (
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
                <Button
                  variant='link'
                  justifyContent='flex-start'
                  onClick={() => setShowPasswordModal(true)}
                >
                  <Text variant='paragraph' color='darkblue.100' cursor='pointer'>
                    Change password
                  </Text>
                </Button>
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
          )}
        </Flex>
        <Modal isOpen={showPasswordModal} onClose={onModalClose} isCentered>
          <ModalOverlay />
          <ModalContent borderRadius={16} boxShadow='0px 4px 16px rgba(38, 50, 56, 0.1)'>
            <ModalHeader pb={2}>
              <Text color='black' variant='header'>
                Update Password
              </Text>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box mb='4'>
                <InputField maxW='100%'>
                  <Text variant='details' color='black' mb={1}>
                    Old password
                  </Text>
                  <Input
                    placeholder='xxxxxxxxx'
                    autoComplete='new-password'
                    type='password'
                    {...register(`oldPassword` as const)}
                  />
                </InputField>
              </Box>
              <Box mb='4'>
                <InputField maxW='100%'>
                  <Text variant='details' color='black' mb={1}>
                    New password
                  </Text>
                  <Input
                    placeholder='xxxxxxxxx'
                    autoComplete='new-password'
                    type='password'
                    {...register(`password` as const)}
                  />
                </InputField>
              </Box>
              <Box mb='4'>
                <InputField maxW='100%'>
                  <Text variant='details' color='black' mb={1}>
                    Confirm password
                  </Text>
                  <Input
                    placeholder='xxxxxxxxx'
                    autoComplete='new-password'
                    type='password'
                    {...register(`confirmPassword` as const)}
                  />
                </InputField>
              </Box>
              <Box textAlign='right'>
                <ChakraLink as={Link} to='/console/forgot' color='blue.400'>
                  Forgot password?
                </ChakraLink>
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button
                variant='outline'
                borderRadius={24}
                border='2px'
                px='22px'
                color='darkblue.100'
                borderColor='darkblue.100'
                _hover={{ bg: 'transparent' }}
                mr={3}
                onClick={onModalClose}
              >
                Cancel
              </Button>
              <PrimaryButton
                disabled={!password || !oldPassword || !confirmPassword}
                label='Update'
                variant='emphasis'
                color='white'
                onClick={updatePassword}
              ></PrimaryButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </FormProvider>
  )
}
