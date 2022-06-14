import { Box, Checkbox, Flex, Text, Select, Grid, Input, Button, Icon } from '@chakra-ui/react'
import { NotificationChannel } from '@httpmon/db'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { FiPlus, FiTrash2 } from 'react-icons/fi'

export function MonitorNotifications() {
  const { register } = useFormContext()
  return (
    <>
      <Flex alignItems='center' mb={3}>
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
      <Channels />
    </>
  )
}

function Channels() {
  const { control, register, watch } = useFormContext()
  const {
    fields: channels,
    append,
    remove,
  } = useFieldArray({
    name: 'notifications.channels',
    control,
  })

  const channelValues: NotificationChannel[] = watch('notifications.channels')

  return (
    <Grid gap='3'>
      {channels.map((field, index) => (
        <Flex key={field.id} gap='2'>
          <Select {...register(`notifications.channels.${index}.type`)}>
            <option value='Email'>Email</option>
            <option value='Slack'>Slack</option>
          </Select>

          <Input
            type='text'
            {...register(`notifications.channels.${index}.target` as const)}
            placeholder='target'
          />

          <Input
            type='text'
            {...register(`notifications.channels.${index}.info` as const)}
            placeholder='info'
          />

          <Button bg='lightgray.100' onClick={() => remove(index)}>
            <Icon color='gray.300' as={FiTrash2} cursor='pointer' />
          </Button>
        </Flex>
      ))}
      <Button bg='lightgray.100' onClick={() => append([{ type: '', value: '' }])} maxW='42px'>
        <Icon color='darkblue.100' as={FiPlus} cursor='pointer' />
      </Button>
    </Grid>
  )
}
