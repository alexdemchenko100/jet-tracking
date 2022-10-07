import { Box, Button, Flex, Divider, useToast, Icon, Input } from '@chakra-ui/react'
import { useState } from 'react'
import { MonEnv } from '@httpmon/db'
import axios from 'axios'
import { useFieldArray, useForm } from 'react-hook-form'
import { FiTrash2, FiPlus, FiEdit, FiSave } from 'react-icons/fi'
import { useMutation, useQuery } from 'react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { Store } from '../services/Store'
import { Section, Text, PrimaryButton, Loading } from '../components'

export function EnvEditor() {
  const { id } = useParams()
  const [editNameEnabled, setEditNameEnabled] = useState<boolean>(false)

  const toast = useToast()
  const navigate = useNavigate()

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
    formState: { isDirty, isValid, errors },
    reset,
  } = useForm<MonEnv>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

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

  const watched = watch()

  const cancelChanges = () => {
    reset()
  }

  async function handleSaveEnv(data: MonEnv) {
    await saveEnv(data)
    Store.queryClient?.invalidateQueries(['monenv'])
    toast({
      position: 'top',
      description: 'The Env has been updated successfully.',
      status: 'success',
      duration: 1500,
      isClosable: false,
    })
    navigate(`/console/envs/${data.id}`)
  }

  if (!monEnv) return <Loading />

  return (
    <Section py={4} w='100%'>
      <form onSubmit={handleSubmit(handleSaveEnv)}>
        <Flex justify='start' gap={4} direction='column'>
          {!editNameEnabled ? (
            <Flex alignItems='center' gap='4'>
              <Text variant='title' color='black'>
                {watched.name}
              </Text>
              <Button
                w={7}
                h={7}
                minW={6}
                borderRadius='4'
                bg='transparent'
                p='0'
                onClick={() => setEditNameEnabled(true)}
              >
                <Icon color='darkgray.100' as={FiEdit} cursor='pointer' />
              </Button>
            </Flex>
          ) : (
            <Flex alignItems='center' gap='4'>
              <Input
                type='text'
                borderColor={errors.name ? 'red' : 'gray.200'}
                placeholder='Add name'
                {...register('name', { required: true, pattern: /^[A-Z0-9_-]{1,}$/i })}
              />
              <Button
                w={10}
                h={10}
                minW={6}
                borderRadius='4'
                bg='lightgray.100'
                disabled={!!errors.name}
                p='0'
                onClick={() => setEditNameEnabled(false)}
              >
                <Icon color='darkgray.100' as={FiSave} cursor='pointer' />
              </Button>
            </Flex>
          )}
          <Divider />

          <Box mt='2'>
            {tuples.map((field, index) => (
              <Flex key={field.id} alignItems='flex-end' mb='2' gap={4}>
                <Box w={96} position='relative'>
                  <Text variant='details' color='black'>
                    Name
                  </Text>
                  <Input
                    type='text'
                    borderColor={
                      errors.env && errors.env[index] && errors.env[index][0] ? 'red' : 'gray.200'
                    }
                    {...register(`env.${index}.0` as const, {
                      required: true,
                      pattern: /^[A-Z0-9_-]{1,}$/i,
                    })}
                    placeholder='Name'
                  />
                  {errors.env && errors.env[index] && errors.env[index][0]?.type === 'required' && (
                    <Text position='absolute' left='0' top='100%' variant='details' color='red'>
                      * Name Required
                    </Text>
                  )}
                  {errors.env && errors.env[index] && errors.env[index][0]?.type === 'pattern' && (
                    <Text position='absolute' left='0' top='100%' variant='details' color='red'>
                      * Name is invalid
                    </Text>
                  )}
                </Box>
                <Box w={96} position='relative'>
                  <Text variant='details' color='black'>
                    Value
                  </Text>
                  <Input
                    type='text'
                    borderColor={
                      errors.env && errors.env[index] && errors.env[index][1] ? 'red' : 'gray.200'
                    }
                    {...register(`env.${index}.1` as const, {
                      required: true,
                    })}
                    placeholder='Value'
                  />
                  {errors.env && errors.env[index] && errors.env[index][1]?.type === 'required' && (
                    <Text position='absolute' left='0' top='100%' variant='details' color='red'>
                      * Value Required
                    </Text>
                  )}
                </Box>
                <Button borderRadius='4' bg='lightgray.100' px={3} onClick={() => remove(index)}>
                  <Icon color='gray.300' as={FiTrash2} cursor='pointer' />
                </Button>
              </Flex>
            ))}
          </Box>
          <Flex align='center'>
            <Button px={0} variant='unstyled' onClick={() => append([['', '']])}>
              <Flex align='center'>
                <Icon
                  bg='rgba(24, 119, 242, 0.15)'
                  p='0.5'
                  width={4}
                  height={4}
                  mr='2'
                  borderRadius='4'
                  color='darkblue.100'
                  as={FiPlus}
                  cursor='pointer'
                />
                <Text variant='text-field' color='darkblue.100'>
                  Add variable
                </Text>
              </Flex>
            </Button>
          </Flex>

          {isValid && isDirty && (
            <Flex align='center' justifyContent='flex-end' gap={2}>
              <PrimaryButton
                label='Cancel'
                isOutline
                variant='emphasis'
                color={'darkblue.100'}
                onClick={cancelChanges}
              ></PrimaryButton>
              <PrimaryButton
                label='Save'
                variant='emphasis'
                color={'white'}
                type='submit'
              ></PrimaryButton>
            </Flex>
          )}
        </Flex>
      </form>
    </Section>
  )
}
