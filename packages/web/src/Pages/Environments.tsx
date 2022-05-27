import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import { MonEnv, Monitor } from '@httpmon/db'
import axios from 'axios'
import { useMutation } from 'react-query'

export function EnvCard() {}

export function Environments() {
  const { isOpen, onOpen, onClose } = useDisclosure()

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
    const resp = await createEnv(data)

  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form>
            <ModalCloseButton />
            <ModalBody>
              <Heading fontSize='2xl' mb='10'>
                New Environment
              </Heading>
              <FormControl id='envName'>
                <FormLabel>Name</FormLabel>
                <Input id='name' />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme='blue' mr='3' onClick={onClose}>
                Create
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      <Flex justify='space-between'>
        <Heading size='lg' mb='8'>
          Environments
        </Heading>

        <Button size='md' mr='2' mb='2' colorScheme='blue' onClick={onOpen}>
          New Environment
        </Button>
      </Flex>
    </>
  )
}
