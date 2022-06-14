import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { MonEnv, MonitorTuples } from '@httpmon/db'
import axios from 'axios'
import { useFieldArray, useForm } from 'react-hook-form'
import { FiTrash2, FiPlus } from 'react-icons/fi'
import { useMutation, useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { Store } from '../services/Store'

function numEnv(monEnv: MonEnv) {
  return monEnv.env ? monEnv.env.length : 0
}
function EnvCard({ monEnv }: { monEnv: MonEnv }) {
  const navigate = useNavigate()
  return (
    <Flex
      flexDirection='column'
      gap='4'
      borderRadius='xl'
      bgColor='blue.100'
      boxShadow='md'
      p='8'
      w='20em'
      justifyContent='begin'
      cursor='pointer'
      onClick={() => navigate(`/console/env/${monEnv.id}`)}
    >
      <Flex gap='2' direction='column'>
        <Heading size='md'>Env: {monEnv.name}</Heading>
        <Text>{numEnv(monEnv)} entries</Text>
      </Flex>
    </Flex>
  )
}

export function Environments() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MonEnv>({
    defaultValues: {
      env: [] as MonitorTuples,
    },
  })

  const {
    mutateAsync: createEnv,
    isLoading: isCreating,
    error: createError,
  } = useMutation<MonEnv, Error, MonEnv>(async (data: MonEnv) => {
    const resp = await axios({
      method: 'PUT',
      url: '/environments',
      data: { ...data },
    })
    return resp.data as MonEnv
  })

  async function handleEnvCreate(data: MonEnv) {
    console.log('data: ', data)
    const resp = await createEnv({ ...data })
    onClose()
  }

  const { data: envs } = useQuery<MonEnv[]>(['monenv'], async () => {
    const resp = await axios({
      method: 'GET',
      url: `/environments`,
    })
    return resp.data as MonEnv[]
  })

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(handleEnvCreate)}>
            <ModalCloseButton />
            <ModalBody>
              <Heading fontSize='2xl' mb='10'>
                New Environment
              </Heading>
              <FormControl id='envName'>
                <FormLabel>Name</FormLabel>
                <Input id='name' {...register('name')} />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme='blue' mr='3' type='submit'>
                Create
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      <Flex justify='space-between' m={2}>
        <Heading size='lg' mb='8'>
          Environments
        </Heading>

        <Button size='md' mr='2' mb='2' colorScheme='blue' onClick={onOpen}>
          New Environment
        </Button>
      </Flex>

      <Flex direction='column' gap='3'>
        {envs &&
          envs.map((item) => {
            return <EnvCard key={item.name} monEnv={item}></EnvCard>
          })}
      </Flex>
    </>
  )
}
