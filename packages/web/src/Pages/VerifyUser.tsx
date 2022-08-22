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
} from '@chakra-ui/react'
import axios from 'axios'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from 'react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createUserWithEmailAndPassword, getAuth, updateProfile } from 'firebase/auth'
import { logoTitle } from '../Assets'

type FormParams = {
  fullName: string
  password: string
}

export default function VerifyUser() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Verify email | ProAutoma'
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormParams>()

  const { data: status } = useQuery(['usersVerify'], async () => {
    const resp = await axios({
      method: 'POST',
      url: '/settings/users/verify',
      data: {
        token: searchParams.get('token'),
        email: searchParams.get('email'),
      },
    })
    return resp.data.message
  })

  const setUserPassword = async (data: FormParams) => {
    const email = searchParams.get('email')
    if (!email) return
    const creds = await createUserWithEmailAndPassword(getAuth(), email, data.password)
    await updateProfile(creds.user, { displayName: data.fullName })
    navigate('/console/signin')
  }

  return (
    <Box textAlign='center' py='20' px='6'>
      <Image src={logoTitle} mb={20} mx='auto' />
      {status === 'success' && (
        <>
          <Heading display='inline-block' size='xl' color='darkgray.100'>
            Congrats!
          </Heading>
          <Text color={'gray.500'} mb='6' fontSize='lg' mt={5}>
            You have been successfully verified. You are a member of this team.
            <br />
            Please fill out this form to complete registration.
          </Text>
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
        </>
      )}
      {status == 'already_verified' && (
        <>
          <Heading display='inline-block' size='xl' color='darkgray.100'>
            Oh!
          </Heading>
          <Text color={'gray.500'} mb='6' fontSize='lg' mt={5}>
            Your email was already verified.
          </Text>
        </>
      )}
      {status == 'failed' && (
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
