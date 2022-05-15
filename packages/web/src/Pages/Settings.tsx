import { Divider, Flex, FormLabel, Heading, Input } from '@chakra-ui/react'
import { useAuth } from '../services/FirebaseAuth'

export function Settings() {
  const { userInfo } = useAuth()

  return (
    <Flex direction='column' gap='4'>
      <Heading size='md'>Settings</Heading>
      <Divider />
      <Flex direction='column' gap='2' boxShadow='lg' p='2' bgColor=''>
        <form>
          <FormLabel htmlFor='name'>Name</FormLabel>
          <Input value={userInfo.displayName} isDisabled />
          <FormLabel htmlFor='name'>Email</FormLabel>
          <Input value={userInfo.email} isDisabled />
        </form>
      </Flex>
    </Flex>
  )
}
