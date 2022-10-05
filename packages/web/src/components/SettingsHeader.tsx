import { Flex, Icon, Button } from '@chakra-ui/react'
import { FiEdit } from 'react-icons/fi'
import { Section, Text } from '../components'

interface Props {
  title: string
}

function SettingsHeader({ title }: Props) {
  return (
    <Section position='absolute' top='0' left='0' width='100%'>
      <Flex alignItems='center' justify={'space-between'}>
        <Text variant='header' color='black'>
          {title}
        </Text>
      </Flex>
    </Section>
  )
}

export default SettingsHeader
