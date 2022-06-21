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
} from '@chakra-ui/react'
import { FiBell, FiEdit } from 'react-icons/fi'
import { useFormContext } from 'react-hook-form'

import { Section, Text } from '../components'

export default function SettingsNotifications() {
  const { register } = useFormContext()

  return (
    <Box width='100%'>
      <Section pt={4} pb={6} minH={60}>
        <Text variant='title' color='black'>Notifications</Text>
        <Flex flexWrap={'wrap'} gap={4} mt={7}>
          <Flex gap={2} px={4} py={3} borderRadius='8' borderWidth='1px' borderColor='gray.200' borderStyle='solid' width='100%' maxW={'656px'} justifyContent='space-between'>
            <Flex alignItems='center' flex='1' gap={2} flexWrap='wrap'>
              <Flex alignItems='center'>
                <Icon as={FiBell} mr={2} />
                <Text variant='text-field' className='captialize-first-letter' maxW='calc(100vw - 580px)' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap' color='black'>sfa sdf awefsfas df asdfasd First notification&nbsp;&nbsp;–</Text>
              </Flex>
              <Text variant='text-field' color='gray.300'>sluna@proautoma.com</Text>
            </Flex>
            <Button w={6} h={6} minW={6} borderRadius='4' bg='lightgray.100' p='0' onClick={() => {}}>
              <Icon color='gray.300' fontSize={'xs'} as={FiEdit} cursor='pointer' />
            </Button>
          </Flex>
        </Flex>
      </Section>
      <Section pt={4} pb={6}>
        <Text variant='title' color='black'>Add new notification</Text>
        <Flex gap='4' flexWrap='wrap' mt={8} mb={7}>
          <Input
            borderRadius={8}
            borderColor='gray.200'
            type='text'
            maxW='80'
            {...register(`new_notification.name` as const)}
            placeholder='Name'
          />
          <Select borderRadius={8} borderColor='gray.200' maxW='80' {...register(`new_notification.type`)}>
            <option value='code'>Slack</option>
            <option value='totalTime'>Email</option>
          </Select>
        </Flex>
        <Box mt={4}>
          <FormControl display='flex' alignItems='center'>
            <Switch id='advanced_security' size="sm" mr={2} {...register(`new_notification.default_enabled` as const)} />
            <FormLabel htmlFor='advanced_security' m={0}>
              <Text variant='text-field' color='black'>Default enabled</Text>
            </FormLabel>
          </FormControl>
        </Box>
        <Box mt={4}>
          <FormControl display='flex' alignItems='center'>
            <Switch id='activity-logs' size="sm" mr={2} {...register(`new_notification.apply_on_existing_monitors` as const)} />
            <FormLabel htmlFor='activity-logs' m={0}>
              <Text variant='text-field' color='black'>Apply on all existing monitors</Text>
            </FormLabel>
          </FormControl>
        </Box>
      </Section>
    </Box>
  )
}
