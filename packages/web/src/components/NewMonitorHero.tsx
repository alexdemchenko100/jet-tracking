import { Center, VStack, Box } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import PrimaryButton from './PrimaryButton'
import Text from './Text'
import Section from './Section'
import RafikiSvg from '../assets/rafiki.svg'

export default function NewMonitorHero() {
  const navigate = useNavigate()

  return (
    <Section mb={0}>
      <Center h='calc(100vh - 5.5em)'>
        <VStack spacing='8'>
          <img src={RafikiSvg} width='620px' alt='new monitor hero page' />
          <Text variant='header' color='black'>
            Explore API and create a new monitor
          </Text>
          <PrimaryButton
            label='New Monitor'
            variant='emphasis'
            color='white'
            onClick={() => navigate('/console/monitors/newapi')}
          ></PrimaryButton>
          <Box h={25}></Box>
        </VStack>
      </Center>
    </Section>
  )
}
