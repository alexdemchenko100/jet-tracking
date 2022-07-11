import { Box, Heading, Text, Image, useToast } from '@chakra-ui/react'
import axios from 'axios'
import { useEffect } from 'react'
import { useQuery } from 'react-query'
import { useSearchParams } from 'react-router-dom'
import { logoTitle } from '../Assets'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const toast = useToast()

  useEffect(() => {
    document.title = 'Verify email | ProAutoma'
  }, [])

  const { data: status } = useQuery(['emailsVerify'], async () => {
    const resp = await axios({
      method: 'POST',
      url: '/settings/emails/verify',
      data: {
        token: searchParams.get('token'),
        email: searchParams.get('email'),
      },
    })
    return resp.data.message
  })

  return (
    <Box textAlign='center' py='20' px='6'>
      <Image src={logoTitle} mb={20} mx='auto' />
      {status == 'success' && (
        <>
          <Heading display='inline-block' size='xl' color='darkgray.100'>
            Congrats!
          </Heading>
          <Text color={'gray.500'} mb='6' fontSize='lg' mt={5}>
            Your email has been successfully verified. You can get email notifications.
          </Text>
        </>
      )}
      {status == 'already_verified' && (
        <>
          <Heading display='inline-block' size='xl' color='darkgray.100'>
            Oops!
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
