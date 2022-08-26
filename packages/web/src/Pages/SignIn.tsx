import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  UserCredential,
  AuthError,
  User,
  getRedirectResult,
} from 'firebase/auth'

import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'

import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  Text,
  Link as ChakraLink,
  Image,
  HStack,
  VStack,
} from '@chakra-ui/react'
import { Link, Navigate, useLocation } from 'react-router-dom'

import { logoTitle, googleSigninButton } from '../Assets'
import { isLoggedIn, setUser } from '../services/FirebaseAuth'

export type SignInForm = {
  email: string
  password: string
  remember: boolean
}

export function SignIn() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignInForm>()

  const {
    mutateAsync: signInAsync,
    isLoading,
    error,
  } = useMutation<UserCredential, AuthError, SignInForm | undefined>(async (data?: SignInForm) => {
    let creds
    try {
      if (!data) {
        const auth = getAuth()
        const provider = new GoogleAuthProvider()
        await signInWithRedirect(auth, provider)
        // After returning from the redirect when your app initializes you can obtain the result
        creds = await getRedirectResult(auth)
      } else {
        creds = await signInWithEmailAndPassword(getAuth(), data.email, data.password)
      }
    } catch (e) {
      //console.error(e)
    }

    if (!creds || !creds.user || !creds.user.emailVerified) {
      setError('email', { type: 'focus', message: 'invalid email/password' })
      throw new Error('invalid email/password')
    }

    return creds
  })

  async function handleSignIn(data?: SignInForm) {
    // login and wait for response
    try {
      const creds = await signInAsync(data)
      setUser(creds.user)
    } catch (e) {
      setUser(null)
    }
  }

  interface LocationState {
    from: {
      pathname: string
    }
  }

  const location = useLocation()
  const { from } = (location.state as LocationState) || { from: { pathname: '/console/monitors' } }

  if (isLoggedIn()) {
    return <Navigate to={from} replace />
  }

  return (
    <Flex minH='100vh' justify='center' bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing='8' mx='auto' w='100%' maxW='lg' py='12' px='6'>
        <Image w='40' mb='10' src={logoTitle} />
        <form onSubmit={handleSubmit(handleSignIn)}>
          <Box rounded={'lg'} bg={useColorModeValue('white', 'gray.700')} boxShadow='lg' p='8'>
            <Stack align='center'>
              <Heading fontSize='2xl' mb='10'>
                Sign in to your account
              </Heading>
            </Stack>
            <Stack spacing='6'>
              <FormControl id='email'>
                <FormLabel>Email</FormLabel>
                <Input type='email' required {...register('email')} />
              </FormControl>
              {errors.email && <Text color='red.500'>{errors.email.message}</Text>}
              <FormControl id='password'>
                <FormLabel>Password</FormLabel>
                <Input type='password' required autoComplete='on' {...register('password')} />
              </FormControl>
              {errors.password && <Text color='red.500'>{errors.password.message}</Text>}
              <Stack spacing='10'>
                <Stack
                  direction={{ base: 'column', sm: 'row' }}
                  align={'start'}
                  justify={'space-between'}
                >
                  <Checkbox {...register('remember')}>Remember me</Checkbox>
                  <ChakraLink as={Link} to='/console/forgot' color='blue.400'>
                    Forgot password?
                  </ChakraLink>
                </Stack>
                <Button
                  type='submit'
                  bg='blue.400'
                  color='white'
                  _hover={{
                    bg: 'blue.500',
                  }}
                >
                  Sign in
                </Button>
                <VStack>
                  <Text fontSize='md' whiteSpace='nowrap'>
                    or continue with
                  </Text>
                  <Image w='60%' src={googleSigninButton} onClick={() => handleSignIn()}></Image>
                </VStack>
              </Stack>
            </Stack>
          </Box>
        </form>
        <HStack align='center' spacing='4'>
          <Text>Don't have an account?</Text>
          <ChakraLink as={Link} to='/console/signup' color='blue.400'>
            Sign up
          </ChakraLink>
        </HStack>
      </Stack>
    </Flex>
  )
}
