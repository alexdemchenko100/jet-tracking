import { Box, Button, Flex, FormControl, FormLabel, Heading, Icon, Input } from '@chakra-ui/react'
import { MonEnv } from '@httpmon/db'
import axios from 'axios'
import { useFieldArray, useForm } from 'react-hook-form'
import { FiTrash2, FiPlus } from 'react-icons/fi'
import { useMutation, useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { Store } from '../services/Store'

export function EnvEditor() {
  const { id } = useParams()
  const name = 'env'

  const { data: monEnv } = useQuery<MonEnv>(['monenv', id], async () => {
    const resp = await axios({
      method: 'GET',
      url: `/environments/${id}`,
    })
    reset(resp.data)
    return resp.data as MonEnv
  })

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MonEnv>()

  const {
    fields: tuples,
    append,
    remove,
  } = useFieldArray({
    name: 'env',
    control,
  })

  const {
    mutateAsync: saveEnv,
    isLoading: isCreating,
    error: createError,
  } = useMutation<MonEnv, Error, MonEnv>(async (data: MonEnv) => {
    const resp = await axios({
      method: 'POST',
      url: `/environments/${monEnv?.id}`,
      data: { ...data },
    })

    return resp.data as MonEnv
  })

  async function handleSaveEnv(data: MonEnv) {
    await saveEnv(data)
    Store.queryClient?.invalidateQueries(['monenv'])
  }

  if (!monEnv) return <p>Loading...</p>

  return (
    <Box mt='4' maxW='600'>
      <form onSubmit={handleSubmit(handleSaveEnv)}>
        <Flex direction='column' gap='4' alignItems='flex-start'>
          <Heading color='purple' borderBottom='2px solid'>
            Env: {monEnv.name}
          </Heading>

          {/* <Flex>
            <FormLabel>Env Name</FormLabel>
            <Input type='name' {...register('name')} />
          </Flex> */}

          {/* <Heading size='lg'>Variables</Heading> */}
          {tuples.map((field, index) => (
            <Flex key={field.id}>
              <Input type='text' {...register(`${name}.${index}.0` as const)} placeholder='name' />
              <Input
                type='text'
                ml='4'
                {...register(`${name}.${index}.1` as const)}
                placeholder='value'
              />

              <Button onClick={() => remove(index)}>
                <Icon color='red.500' as={FiTrash2} cursor='pointer' />
              </Button>
            </Flex>
          ))}
          <Button size='lg' variant='ghost' colorScheme='blue' onClick={() => append([['', '']])}>
            <Icon as={FiPlus} cursor='pointer' />
            Add Variable
          </Button>

          <Button colorScheme='blue' type='submit' w='24'>
            Save
          </Button>
        </Flex>
      </form>
    </Box>
  )
}
