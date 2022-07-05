import { Flex, Button, Icon, Box, Input, Divider, useToast } from '@chakra-ui/react'
import { MonEnv, MonitorTuples } from '@httpmon/db'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useForm, useFieldArray } from 'react-hook-form'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { Section, Text, PrimaryButton } from '../components'

export default function NewEnv() {
  const [formChanged, setFormChanged] = useState<boolean>(false)
  const { control, register, watch, reset, handleSubmit } = useForm<MonEnv>({
    defaultValues: {
      name: '' as string,
      env: [['', '']] as MonitorTuples,
    },
  })
  const toast = useToast()
  const navigate = useNavigate()

  watch()

  const {
    fields: env,
    append,
    remove,
  } = useFieldArray({
    name: 'env',
    control,
  })

  useEffect(() => {
    const subscription = watch((value) => {
      if (
        (value.env && value.env[0] && value.env[0][0]) ||
        (value.env && value.env[0] && value.env[0][1]) ||
        (value.env && value.env.length > 1) ||
        value.name
      ) {
        setFormChanged(true)
      } else {
        setFormChanged(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  const cancelChanges = () => {
    reset()
    setFormChanged(false)
  }

  const checkFormValidation = (data: MonEnv) => {
    let isValid = true
    const { env, name } = data
    if (!name) {
      isValid = false
    }
    env.forEach((item) => {
      if (!item[0] || !item[1]) {
        isValid = false
      }
    })
    return isValid
  }

  const saveChanges = async (data: MonEnv) => {
    if (env.length < 1) {
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
      // Save new env
      const resp = await axios({
        method: 'PUT',
        url: '/environments',
        data,
      })
      if (resp.data) {
        toast({
          position: 'top',
          description: 'New Env has been created successfully.',
          status: 'success',
          duration: 1500,
          isClosable: false,
        })
        navigate('/console/envs')
      }
    }
  }

  return (
    <Section py={4} w='100%'>
      <form onSubmit={handleSubmit(saveChanges)}>
        <Flex justify='start' gap={4} direction='column'>
          <Input type='text' placeholder='Add name' {...register('name')} />
          <Divider />
          <Box mt='2'>
            {env.map((_, index) => (
              <Flex key={index} alignItems='flex-end' mb='2' gap={4}>
                <Box w={96}>
                  <Text variant='details' color='black'>
                    Token
                  </Text>
                  <Input type='text' {...register(`env.${index}.0` as const)} placeholder='Token' />
                </Box>
                <Box w={96}>
                  <Text variant='details' color='black'>
                    Key
                  </Text>
                  <Input type='text' {...register(`env.${index}.1` as const)} placeholder='Key' />
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
    </Section>
  )
}
