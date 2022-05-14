import {
  Flex,
  Heading,
  Button,
  Icon,
  Box,
  Input,
  FormControl,
  FormLabel,
  Divider,
} from '@chakra-ui/react'
import { MonitorTuples } from '@httpmon/db'
import {} from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { FiPlusCircle, FiTrash2 } from 'react-icons/fi'

export default function NewEnv() {
  const { control, register } = useForm({
    defaultValues: {
      env: [] as MonitorTuples,
    },
  })
  const {
    fields: env,
    append,
    remove,
  } = useFieldArray({
    name: 'env',
    control,
  })

  return (
    <>
      <form>
        <Flex minH='100vh' justify='start' direction='column'>
          <Heading size='sm'>Environment</Heading>
          <Divider />

          <FormControl mt='4' id='name'>
            <FormLabel htmlFor='name'>Name</FormLabel>
            <Input type='name' placeholder='' />
          </FormControl>

          <Flex align='center'>
            <Heading size='sm'>Add Env Variable</Heading>
            <Button ml='4' onClick={() => append([['', '']])}>
              <Icon color='blue.500' as={FiPlusCircle} cursor='pointer' />
            </Button>
          </Flex>

          <Box mt='4'>
            {env.map((_, index) => (
              <Flex key={index} mb='2'>
                <Input type='text' {...register(`env.${index}.0` as const)} defaultValue='' />
                <Input
                  type='text'
                  ml='4'
                  {...register(`env.${index}.1` as const)}
                  defaultValue=''
                />

                <Button onClick={() => remove(index)}>
                  <Icon color='red.500' as={FiTrash2} cursor='pointer' />
                </Button>
              </Flex>
            ))}
          </Box>
          <Button mt='4' type='submit' variant='solid' colorScheme='blue' w='40'>
            Save
          </Button>
        </Flex>
      </form>
    </>
  )
}
