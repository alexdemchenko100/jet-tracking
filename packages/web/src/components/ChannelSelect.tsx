import {
  Box,
  Flex,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Image,
} from '@chakra-ui/react'
import { FiChevronDown } from 'react-icons/fi'

import { Text } from '../components'
import { BlueEmailIcon, MSTeamsIcon, SlackIcon } from '../Assets'

interface ChannelSelectProps {
  channel?: string
  onSelect: (_: string) => void
}

const ChannelSelect: React.FC<ChannelSelectProps> = ({ channel, onSelect }) => {
  let label = '';
  switch (channel) {
    case 'slack':
      label = 'Slack'
      break;
    case 'email':
      label = 'Email'
      break;
    case 'ms-teams':
      label = 'Microsoft Teams'
      break;
    default:
      label = ''
  }
  
  return (
    <Menu>
      <MenuButton
        as={Button}
        bg='transparent'
        width={80}
        rightIcon={<FiChevronDown />}
        border='1px'
        borderStyle='solid'
        borderColor='gray.200'
        borderRadius={8}
        textAlign='left'
        _hover={{ bg: 'transparent' }}
        _active={{ bg: 'transparent' }}
      >
        <Text variant='paragraph' color='gray.300' textTransform='capitalize'>{label}</Text>
      </MenuButton>
      <MenuList width={80} px={2} py={3}>
        <MenuItem onClick={() => onSelect('email')}>
          <Flex width='100%' gap={2.5} alignItems='center'>
            <Image src={BlueEmailIcon} w={9} h={9} objectFit='contain'></Image>
            <Text variant='text-field' color='darkgray.100'>Email</Text>
          </Flex>
        </MenuItem>
        <MenuItem onClick={() => onSelect('slack')}>
          <Flex width='100%' gap={2.5} alignItems='center'>
            <Box w={9} h={9} bg='white' borderRadius='18' p={1.5}>
              <Image src={SlackIcon} objectFit='contain'></Image>
            </Box>
            <Text variant='text-field' color='darkgray.100'>Slack</Text>
          </Flex>
        </MenuItem>
        <MenuItem onClick={() => onSelect('ms-teams')}>
          <Flex width='100%' gap={2.5} alignItems='center'>
            <Box w={9} h={9} bg='white' borderRadius='18' p={1.5}>
              <Image src={MSTeamsIcon} objectFit='contain'></Image>
            </Box>
            <Text variant='text-field' color='darkgray.100'>Microsoft Teams</Text>
          </Flex>
        </MenuItem>
      </MenuList>
    </Menu>
  )
}

export default ChannelSelect
