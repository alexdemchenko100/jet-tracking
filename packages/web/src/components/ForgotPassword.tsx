import { logoTitle } from '../Assets'
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  useDisclosure,
  Center,
  Box,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  Image,
  Stack,
  useColorModeValue,
  Divider,
  Spinner,
  toast,
  useToast,
} from '@chakra-ui/react'
import { AuthError, getAuth, ActionCodeSettings, sendPasswordResetEmail } from 'firebase/auth'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'

export default function ForgotPassword() {
  type ForgotParams = {
    email: string
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotParams>()

  const {
    mutateAsync: forgotPasswordAsync,
    isLoading,
    error,
  } = useMutation<void, AuthError, ForgotParams>(
    async (data: ForgotParams) => {
      await firebaseForgotPassword(data.email)
    },
    {
      onSuccess: () => {
        toast({
          position: 'top',
          title: 'Password reset email sent',
          description: 'Check your email for instructions on how to reset your password',
          status: 'success',
          duration: 3000,
          isClosable: true,
          onCloseComplete: () => {
            navigate('/console/signin')
          },
        })
      },
      onError: (e: AuthError) => {
        toast({
          position: 'top',
          title: 'Error sending password reset email',
          description: forgotErrorMessgae(e),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      },
    }
  )

  async function firebaseForgotPassword(email: string) {
    const actionCodeSettings: ActionCodeSettings = {
      url: window.location.origin + '/console/signin',
      handleCodeInApp: true,
    }
    await sendPasswordResetEmail(getAuth(), email, actionCodeSettings)
  }

  async function handleForgotPassword(data: ForgotParams) {
    try {
      await forgotPasswordAsync(data)
    } catch (e) {}
  }

  const toast = useToast()
  const navigate = useNavigate()

  function forgotErrorMessgae(error: AuthError | undefined) {
    if (error) {
      if (error.code === 'auth/email-already-in-use') {
        return 'Email already in use'
      }
      if (error.code === 'auth/invalid-email') {
        return 'Invalid email'
      }
      if (error.code === 'auth/user-not-found') {
        return 'User not found'
      }
    }
    return 'Failed to reset password'
  }

  return (
    <Flex minH='100vh' justify='center' bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing='8' mx='auto' w='100%' maxW='lg' py='12' px='6'>
        <Image w='40' mb='10' src={logoTitle} />
        <form onSubmit={handleSubmit(handleForgotPassword)}>
          <Box rounded={'lg'} bg={useColorModeValue('white', 'gray.700')} boxShadow='lg' p='8'>
            <Stack align='center'>
              <Heading fontSize='2xl' mb='10'>
                Reset your password
              </Heading>
            </Stack>
            <Stack spacing='6'>
              <FormControl id='email'>
                <FormLabel>Email</FormLabel>
                <Input type='email' required {...register('email')} />
              </FormControl>
              {errors.email && <Text color='red.500'>{errors.email.message}</Text>}
              <Divider />
              <Button
                type='submit'
                bg='blue.400'
                color='white'
                _hover={{
                  bg: 'blue.500',
                }}
              >
                Send reset email
              </Button>
            </Stack>
          </Box>
        </form>
      </Stack>
    </Flex>
  )
}
