import { Box, Checkbox, Flex, Text, Select } from '@chakra-ui/react'
import { useFormContext } from 'react-hook-form'

export function MonitorNotifications() {
  const { register } = useFormContext()
  return (
    <>
      <Flex alignItems='center'>
        <Text>Notify after this many number of failures </Text>
        <Select ml='4' w='20' {...register('notifications.failCount')}>
          <option value='0'>0</option>
          <option value='1'>1</option>
          <option value='2'>2</option>
          <option value='3'>3</option>
          <option value='4'>4</option>
          <option value='5'>5</option>
          <option value='6'>6</option>
          <option value='7'>7</option>
          <option value='8'>8</option>
        </Select>
      </Flex>
    </>
  )
}
