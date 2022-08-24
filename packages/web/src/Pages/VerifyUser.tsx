import {
  Box,
  Heading,
  Text,
  Image,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useToast,
} from '@chakra-ui/react'
import axios from 'axios'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from 'react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { logoTitle } from '../Assets'

type FormParams = {
  fullName: string
  password: string
}

type UserVerifyResponse = {
  hasDefaultUser: boolean
  status: string
}

export default function VerifyUser() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()

  const email = searchParams.get('email')
  const token = searchParams.get('token')
  const accountId = searchParams.get('accountId')

  useEffect(() => {
    document.title = 'Verify email | ProAutoma'
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormParams>()

  const { data } = useQuery<UserVerifyResponse>(['usersVerify'], async () => {
    const resp = await axios({
      method: 'POST',
      url: '/settings/users/verify',
      data: {
        token,
        email,
        accountId,
      },
    })

    return resp.data
  })

  const setUserPassword = async (data: FormParams) => {
    if (!email) return
    try {
      const resp = await axios({
        method: 'POST',
        url: '/settings/users',
        data: {
          displayName: data.fullName,
          email,
          token,
          password: data.password,
        },
      })
      navigate('/console/signin')
    } catch (_) {
      toast({
        position: 'top',
        description: 'Can not create auth user. Token or Email are invalid',
        status: 'error',
        duration: 2000,
      })
    }
  }

  return (
    <Box textAlign='center' py='20' px='6'>
      <Image src={logoTitle} mb={20} mx='auto' />
      {data?.status === 'success' && (
        <>
          <Heading display='inline-block' size='xl' color='darkgray.100'>
            Congrats!
          </Heading>
          <Text color={'gray.500'} mb='6' fontSize='lg' mt={5}>
            You have been successfully verified. You are a member of this team.
            <br />
            Please fill out this form to complete registration.
          </Text>
        </>
      )}
      {data?.status == 'already_verified' && (
        <>
          <Heading display='inline-block' size='xl' color='darkgray.100'></Heading>
          <Text color={'gray.500'} mb='6' fontSize='lg' mt={5}>
            Your email was already verified.
          </Text>
        </>
      )}
      {data?.hasDefaultUser && (
        <Button
          bg='blue.400'
          color='white'
          _hover={{
            bg: 'blue.500',
          }}
          onClick={() => navigate('/console/signin')}
        >
          Log In
        </Button>
      )}
      {data && !data.hasDefaultUser && (
        <Box maxW='96' margin='auto'>
          <form onSubmit={handleSubmit(setUserPassword)} autoComplete='off'>
            <Box rounded={'lg'} p={8}>
              <Stack spacing='6'>
                <FormControl id='fullName'>
                  <FormLabel>Full name</FormLabel>
                  <Input type='text' required {...register('fullName')} />
                </FormControl>
                {errors.fullName && <Text color='red.500'>{errors.fullName.message}</Text>}
                <FormControl id='password'>
                  <FormLabel>Password</FormLabel>
                  <Input type='password' required {...register('password')} />
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
                  Log In
                </Button>
              </Stack>
            </Box>
          </form>
        </Box>
      )}
      {data?.status === 'failed' && (
        <>
          <Heading display='inline-block' size='xl' color='darkgray.100'>
            Oops!
          </Heading>
          <Text color={'gray.500'} mb='6' fontSize='lg' mt={5}>
            The email or token is invalid.
          </Text>
        </>
      )}
    </Box>
  )
}
