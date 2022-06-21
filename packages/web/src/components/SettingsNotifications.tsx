import { useState } from 'react'
import {
  Box,
  Flex,
  Input,
  Select,
  FormControl,
  Switch,
  FormLabel,
  Icon,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Image,
} from '@chakra-ui/react'
import { FiBell, FiEdit, FiChevronDown } from 'react-icons/fi'
import { useFormContext } from 'react-hook-form'
import axios from 'axios'
import { useQuery } from 'react-query'
import { NotificationChannel } from '@httpmon/db'

import { Section, Text } from '../components'
import { BlueEmailIcon, MSTeamsIcon, SlackIcon } from '../Assets'

interface ChannelSelectProps {
  channel?: string
  onSelect: (_: string) => void
}

const ChannelSelect = ({ channel, onSelect }: ChannelSelectProps) => {
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


export default function SettingsNotifications() {
  const { register, setValue } = useFormContext()
  const [channel, setChannel] = useState<string | undefined>(undefined)

  const selectChannel = (value: string) => {
    setChannel(value)
    setValue('settings.new_notification.channel.type', value)
  }

  const { data: notifications } = useQuery<NotificationChannel[]>(['notifications'], async () => {
    const resp = await axios({
      method: 'GET',
      url: `/settings/notifications`,
    })
    return resp.data as NotificationChannel[]
  })

  return (
    <Box width='100%'>
      <Section pt={4} pb={6} minH={60}>
        <Text variant='title' color='black'>Notifications</Text>
        <Flex flexWrap={'wrap'} gap={4} mt={7}>
          {notifications?.map((notification) => (
            <Flex
              key={notification.id}
              gap={2}
              px={4}
              py={3}
              borderRadius='8'
              borderWidth='1px'
              borderColor='gray.200'
              borderStyle='solid'
              width='100%'
              maxW={'656px'}
              justifyContent='space-between'
            >
              <Flex alignItems='center' flex='1' gap={2} flexWrap='wrap'>
                <Flex alignItems='center'>
                  <Icon as={FiBell} mr={2} />
                  <Text variant='text-field' className='captialize-first-letter' maxW='calc(100vw - 580px)' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap' color='black'>{notification.name}</Text>
                </Flex>
              </Flex>
              <Button w={6} h={6} minW={6} borderRadius='4' bg='lightgray.100' p='0' onClick={() => {}}>
                <Icon color='gray.300' fontSize={'xs'} as={FiEdit} cursor='pointer' />
              </Button>
            </Flex>
          ))}
        </Flex>
      </Section>
      <Section pt={4} pb={6}>
        <Text variant='title' color='black'>Add new notification</Text>
        <Flex gap='4' flexWrap='wrap' mt={8} mb={6}>
          <Flex direction='column'>
            <Text variant='details' mb={1} color='black'>Name</Text>
            <Input
              borderRadius={8}
              borderColor='gray.200'
              type='text'
              width='80'
              {...register(`settings.new_notification.name` as const)}
            />
          </Flex>
          <Flex direction='column'>
            <Text variant='details' mb={1} color='black'>Type</Text>
            <ChannelSelect channel={channel} onSelect={selectChannel} />
          </Flex>
        </Flex>
        {channel === 'email' ? (
          <Flex gap='4' flexWrap='wrap' mb={6}>
            <Flex direction='column'>
              <Text variant='details' mb={1} color='black'>Email *</Text>
              <Input
                borderRadius={8}
                borderColor='gray.200'
                type='text'
                width='80'
                placeholder='Email1, email2, email3, ...'
                {...register(`settings.new_notification.channel.email` as const)}
              />
            </Flex>
            <Flex direction='column'>
              <Text variant='details' mb={1} color='black'>CC</Text>
              <Input
                borderRadius={8}
                borderColor='gray.200'
                type='text'
                width='80'
                placeholder='Email1, email2, email3, ...'
                {...register(`settings.new_notification.channel.cc` as const)}
              />
            </Flex>
            <Flex direction='column'>
              <Text variant='details' mb={1} color='black'>Recipient Name</Text>
              <Input
                borderRadius={8}
                borderColor='gray.200'
                type='text'
                width='80'
                {...register(`settings.new_notification.channel.recipientName` as const)}
              />
            </Flex>
          </Flex>
        ) : (
          <Flex mb={6}>
            <Flex direction='column'>
              <Text variant='details' mb={1} color='black'>Webhook URL</Text>
              <Input
                borderRadius={8}
                borderColor='gray.200'
                type='text'
                width='96'
                {...register(`settings.new_notification.channel.webhookUrl` as const)}
              />
            </Flex>
          </Flex>
        )}
        <Flex gap='4' flexWrap='wrap' mb={7}>
          <Flex direction='column'>
            <Text variant='details' mb={1} color='black'>Notify after this many number of failures</Text>
            <Select width='80' borderRadius={8} color='gray.300' borderColor='gray.200' {...register(`settings.new_notification.failCount`)}>
              {Array(10).fill('').map((_, index) => (
                <option key={index} value={index + 1}>{index + 1}</option>
              ))}
            </Select>
          </Flex>
          <Flex direction='column'>
            <Text variant='details' mb={1} color='black'>Notify after number of minutes</Text>
            <Select width='80' borderRadius={8} color='gray.300' borderColor='gray.200' {...register(`settings.new_notification.failTimeMS`)}>
              <option value=''>&nbsp;</option>
              <option value='5'>5</option>
              <option value='10'>10</option>
              <option value='15'>15</option>
              <option value='20'>20</option>
              <option value='30'>30</option>
              <option value='60'>60</option>
            </Select>
          </Flex>
        </Flex>
        <Box mt={4}>
          <FormControl display='flex' alignItems='center'>
            <Switch id='advanced_security' size="sm" mr={2} {...register(`settings.new_notification.default_enabled` as const)} />
            <FormLabel htmlFor='advanced_security' m={0}>
              <Text variant='text-field' color='black'>Default enabled</Text>
            </FormLabel>
          </FormControl>
        </Box>
        <Box mt={4}>
          <FormControl display='flex' alignItems='center'>
            <Switch id='activity-logs' size="sm" mr={2} {...register(`settings.new_notification.apply_on_existing_monitors` as const)} />
            <FormLabel htmlFor='activity-logs' m={0}>
              <Text variant='text-field' color='black'>Apply on all existing monitors</Text>
            </FormLabel>
          </FormControl>
        </Box>
      </Section>
    </Box>
  )
}
