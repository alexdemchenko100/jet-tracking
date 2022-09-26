import { Box, Button, Flex, Divider, useToast, Icon, Input } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { MonEnv } from '@httpmon/db'
import axios from 'axios'
import { useFieldArray, useForm } from 'react-hook-form'
import { FiTrash2, FiPlus, FiEdit, FiSave } from 'react-icons/fi'
import { useMutation, useQuery } from 'react-query'
import { Store } from '../services/Store'
import { Text, PrimaryButton } from '../components'

const GlobalEnvs: React.FC = () => {
  const toast = useToast()
  const [formChanged, setFormChanged] = useState<boolean>(false)

  const { data: globalMonEnv } = useQuery<MonEnv>(['global-monenv'], async () => {
    const resp = await axios({
      method: 'GET',
      url: `/environments/global`,
    })
    return resp.data as MonEnv
  })

  const { register, control, watch, handleSubmit, reset } = useForm<MonEnv>()

  const {
    fields: tuples,
    append,
    remove,
  } = useFieldArray({
    name: 'env',
    control,
  })

  const { mutateAsync: saveEnv } = useMutation<MonEnv, Error, MonEnv>(async (data: MonEnv) => {
    const resp = await axios({
      method: 'POST',
      url: `/environments/global`,
      data: { env: data.env },
    })

    return resp.data as MonEnv
  })

  watch()

  const cancelChanges = () => {
    reset()
    setFormChanged(false)
  }

  const checkFormValidation = (data: MonEnv) => {
    let isValid = true
    const { env } = data
    env.forEach((item) => {
      if (!item[0] || !item[1]) {
        isValid = false
      }
    })
    return isValid
  }

  useEffect(() => {
    const subscription = watch((value) => {
      if (JSON.stringify(value) !== JSON.stringify(globalMonEnv)) {
        setFormChanged(true)
      } else {
        setFormChanged(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  async function handleSaveEnv(data: MonEnv) {
    if (data.env.length < 1) {
      toast({
        position: 'top',
        description: 'Need one variable at least',
        status: 'error',
        duration: 1500,
        isClosable: false,
      })
    } else if (!checkFormValidation(data)) {
      toast({
        position: 'top',
        description: 'Please fill out all fields',
        status: 'error',
        duration: 1500,
        isClosable: false,
      })
    } else {
      await saveEnv(data)
      Store.queryClient?.invalidateQueries(['global-monenv'])
      toast({
        position: 'top',
        description: 'The Env has been updated successfully.',
        status: 'success',
        duration: 1500,
        isClosable: false,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(handleSaveEnv)}>
      <Flex justify='start' gap={4} direction='column'>
        <Flex alignItems='center' gap='4'>
          <Text variant='title' color='black'>
            Global Env Variables
          </Text>
        </Flex>
        <Box mt='2'>
          {tuples.map((field, index) => (
            <Flex key={field.id} alignItems='flex-end' mb='2' gap={4}>
              <Box w={96}>
                <Text variant='details' color='black'>
                  Name
                </Text>
                <Input type='text' {...register(`env.${index}.0` as const)} placeholder='Name' />
              </Box>
              <Box w={96}>
                <Text variant='details' color='black'>
                  Value
                </Text>
                <Input type='text' {...register(`env.${index}.1` as const)} placeholder='Value' />
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

        <Flex align='center' justifyContent='flex-end' gap={2}>
          <PrimaryButton
            label='Cancel'
            isOutline
            disabled={!formChanged}
            variant='emphasis'
            color={'darkblue.100'}
            onClick={cancelChanges}
          ></PrimaryButton>
          <PrimaryButton
            disabled={!formChanged}
            label='Save'
            variant='emphasis'
            color={'white'}
            type='submit'
          ></PrimaryButton>
        </Flex>
      </Flex>
    </form>
  )
}

export default GlobalEnvs
