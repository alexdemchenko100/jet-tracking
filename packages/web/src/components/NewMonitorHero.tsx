import { Center, Box, Text, Heading, Button, VStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

export function NewMonitorHero() {
  const navigate = useNavigate()

  return (
    <Center h='50vh'>
      <VStack spacing='12'>
        <Text fontSize='6xl'>
          <Text
            as='span'
            fontFamily='Kontora, Poppins, Arial, "Helvetica Neue", Helvetica, sans-serif'
            fontWeight='extrabold'
            color='#2cb67d'
            borderBottom='7px solid'
          >
            Let's start
          </Text>
          <Text as='span'>&nbsp;by creating a new monitor</Text>
        </Text>
        <Button size='lg' colorScheme='blue' onClick={() => navigate('/console/monitors/newapi')}>
          New Monitor
        </Button>
      </VStack>
    </Center>
  )
}
