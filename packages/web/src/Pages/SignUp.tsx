import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Spinner,
  Stack,
  useColorModeValue,
  useDisclosure,
  VStack,
  Image,
  Link as ChakraLink,
  Text,
  Divider,
} from '@chakra-ui/react'

import {
  ActionCodeSettings,
  AuthError,
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  updateProfile,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { Link, useNavigate } from 'react-router-dom'

import { logoTitle, googleSignupButton } from '../Assets'
import { isLoggedIn } from '../services/FirebaseAuth'

type SignUpParams = {
  fullName: string
  email: string
  password: string
}

export default function SignUp() {
  useEffect(() => {
    document.title = 'SignUp | ProAutoma'
  }, [])

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpParams>()

  const {
    mutateAsync: signupAsync,
    isLoading,
    isError,
    isSuccess,
    error,
    data,
  } = useMutation<UserCredential, AuthError, SignUpParams>(async (data: SignUpParams) => {
    return await firebaseSignup(data)
  })

  async function firebaseSignup({ fullName, email, password }: SignUpParams) {
    const creds = await createUserWithEmailAndPassword(getAuth(), email, password)
    await updateProfile(creds.user, { displayName: fullName })
    const actionCodeSettings: ActionCodeSettings = {
      url: window.location.origin + '/console/signin',
      handleCodeInApp: true,
    }
    await sendEmailVerification(creds.user, actionCodeSettings)
    //console.log('email verification sent')
    return creds
  }

  async function handleSignUp(data: SignUpParams) {
    // signin and wait for response
    try {
      await signupAsync(data)
    } catch (e) {}
  }

  async function handleGoogleSignUp() {
    try {
      const auth = getAuth()
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (e) {}
  }

  if (isLoggedIn()) {
    navigate('/console/monitors')
  }

  return (
    <Flex minH={'100vh'} justify={'center'} bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing='8' mx='auto' w='100%' maxW='lg' py='12' px='6'>
        {isLoading && <Spinner />}
        {isSuccess && <SignUpSuccess email={data?.user.email ?? ''} />}
        {isError && <SignUpError error={error} />}
        <Image w='40' mb='10' src={logoTitle} />
        <form onSubmit={handleSubmit(handleSignUp)}>
          <Box rounded={'lg'} bg={useColorModeValue('white', 'gray.700')} boxShadow={'lg'} p={8}>
            <Stack align='center'>
              <Heading fontSize='2xl' mb='10'>
                Create your account
              </Heading>
            </Stack>
            <Stack spacing='6'>
              <FormControl id='email'>
                <FormLabel>Email</FormLabel>
                <Input type='email' required autoComplete='email' {...register('email')} />
              </FormControl>
              {errors.email && <Text color='red.500'>{errors.email.message}</Text>}
              <FormControl id='fullName'>
                <FormLabel>Full name</FormLabel>
                <Input type='text' required autoComplete='name' {...register('fullName')} />
              </FormControl>
              {errors.fullName && <Text color='red.500'>{errors.fullName.message}</Text>}
              <FormControl id='password'>
                <FormLabel>Password</FormLabel>
                <Input
                  type='password'
                  required
                  autoComplete='new-password'
                  {...register('password')}
                />
              </FormControl>
              {errors.password && <Text color='red.500'>{errors.password.message}</Text>}
              <Divider />
              <Button
                type='submit'
                bg='blue.400'
                color='white'
                _hover={{
                  bg: 'blue.500',
                }}
              >
                Create Account
              </Button>
              <VStack>
                <Text fontSize='md' whiteSpace='nowrap'>
                  or continue with
                </Text>
                <Image
                  w='60%'
                  cursor='pointer'
                  src={googleSignupButton}
                  onClick={() => handleGoogleSignUp()}
                ></Image>
              </VStack>
              <VStack>
                <Text size='xs'>By signing up, you agree to the</Text>
                <Text size='xs'>
                  <ChakraLink href='/terms'>Terms of Service</ChakraLink>
                  &nbsp;and&nbsp;
                  <ChakraLink href='/privacy'>Privacy Policy</ChakraLink>
                </Text>
              </VStack>
            </Stack>
          </Box>
        </form>
        <HStack align='center' spacing='4'>
          <Text>Have an account?</Text>
          <ChakraLink as={Link} to='/console/signin' color='blue.400'>
            Sign in
          </ChakraLink>
        </HStack>
      </Stack>
    </Flex>
  )
}

export function SignUpSuccess({ email }: { email: string }) {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true })
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody>
          <Heading fontSize='2xl' mb='10'>
            Please verify your email
          </Heading>
          <Text>
            We sent an email to <strong>{email}</strong> with a link to complete your signup. If you
            don't see it in your inbox, check your spam folder.
          </Text>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme='blue' mr='3' onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function signupErrorMessgae(error: AuthError) {
  if (error.code === 'auth/email-already-in-use') {
    return 'Email already in use'
  }
  if (error.code === 'auth/invalid-email') {
    return 'Invalid email'
  }
  if (error.code === 'auth/weak-password') {
    return 'Weak password'
  }
  return 'Failed to signup'
}

export function SignUpError({ error }: { error: AuthError | null }) {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true })
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Heading fontSize='2xl' mb='10'>
              Signup failed <br />
            </Heading>
            {error && <Text>{signupErrorMessgae(error)}</Text>}
          </ModalBody>

          <ModalFooter>
            <Center>
              <Button colorScheme='blue' mr='3' onClick={onClose}>
                Close
              </Button>
            </Center>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
