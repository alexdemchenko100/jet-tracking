import { Box, Heading, Text, Button, Link } from '@chakra-ui/react'
import { useEffect } from 'react'

export default function NotFound() {
  useEffect(() => {
    document.title = '404 - Not Found | ProAutoma'
  }, [])

  return (
    <Box textAlign='center' py='10' px='6'>
      <Heading
        display='inline-block'
        as='h2'
        size='2xl'
        bgGradient='linear(to-r, blue.400, blue.600)'
        backgroundClip='text'
      >
        404
      </Heading>
      <Heading as='h3' size='lg' mt='3' mb='2'>
        Page Not Found
      </Heading>
      <Text color={'gray.500'} mb='6' fontSize='lg'>
        This page was not found. You may have mistyped the address or the page may have moved.
      </Text>

      <Link href='/'>
        <Button colorScheme='blue' color='white'>
          Go to Home Page
        </Button>
      </Link>
    </Box>
  )
}
