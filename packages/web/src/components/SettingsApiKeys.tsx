import { useState } from 'react'
import {
  Box,
  Flex,
  Input,
  Icon,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Tbody,
  Table,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { FiTrash2, FiPlus, FiClipboard } from 'react-icons/fi'
import axios, { AxiosError } from 'axios'
import { useQuery } from 'react-query'
import { ApiKey } from '@httpmon/db'
import { Text, PrimaryButton, Section, SettingsHeader } from '.'
import { useForm } from 'react-hook-form'

function SettingsApiKeys() {
  const toast = useToast()

  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | undefined>()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])

  const { register, watch, reset, setValue } = useForm<ApiKey>()
  const name = watch('name')

  const { refetch: refetchApiKeys } = useQuery(['users'], async () => {
    const resp = await axios({
      method: 'GET',
      url: '/api-keys',
    })
    setApiKeys(resp.data)
  })

  const onModalClose = () => {
    setShowDeleteModal(false)
    setShowAddModal(false)
    reset()
  }

  const openDeleteModal = (apiKey?: ApiKey) => {
    setShowDeleteModal(true)
    setSelectedApiKey(apiKey)
  }

  const deleteApiKey = async () => {
    await axios.delete(`/api-keys/${selectedApiKey?.id}`)
    toast({
      position: 'top',
      description: 'The Api key has been removed successfully.',
      status: 'info',
      duration: 2000,
    })
    refetchApiKeys()
    onModalClose()
    setSelectedApiKey(undefined)
  }

  const createApiKey = async () => {
    await axios
      .post(`/api-keys`, {
        name,
      })
      .then((res) => {
        toast({
          position: 'top',
          description: 'The Api key has been created successfully.',
          status: 'success',
          duration: 2000,
        })
        const arr = apiKeys.slice()
        arr.push(res.data)
        setApiKeys(arr)
      })
      .catch((error: AxiosError) => {
        toast({
          position: 'top',
          description: error.response?.data.message,
          status: 'error',
          duration: 2000,
        })
      })
      .finally(() => {
        onModalClose()
      })
  }

  const copyToClipboard = (content: string) => {
    const el = document.createElement('textarea')
    el.value = content
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    toast({
      position: 'top',
      description: 'Api Token has been copied to clipboard!',
      status: 'info',
      duration: 2000,
    })
  }

  return (
    <>
      <SettingsHeader formChanged={false} resetForm={() => {}}></SettingsHeader>
      <Section width='100%' pb={10} minH='96'>
        <Flex alignItems='center' justifyContent='flex-end'>
          <Button px={0} variant='unstyled' onClick={() => setShowAddModal(true)}>
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
                Add New Key
              </Text>
            </Flex>
          </Button>
        </Flex>
        <Box overflowX='auto'>
          <Table variant='simple' mt={6}>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Token</Th>
                <Th align='right'>&nbsp;</Th>
              </Tr>
            </Thead>
            <Tbody>
              {apiKeys?.map((key: ApiKey) => (
                <Tr key={key.id}>
                  <Td>{key.name}</Td>
                  {key.token ? (
                    <Td>
                      <Flex
                        maxW='64'
                        alignItems='center'
                        borderRadius={4}
                        bg='lightgray.100'
                        py='1.5'
                        px='2'
                      >
                        <Text flex='1' variant='small' color='gray'>
                          {key.token}
                        </Text>
                        <Icon
                          color='gray.300'
                          fontSize={'sm'}
                          as={FiClipboard}
                          cursor='pointer'
                          onClick={() => copyToClipboard(key.token || '')}
                        />
                      </Flex>
                    </Td>
                  ) : (
                    <Td>-</Td>
                  )}
                  <Td>
                    <Flex alignItems='center' gap={2} justifyContent='flex-end'>
                      <Button
                        w={6}
                        h={6}
                        minW={6}
                        borderRadius='4'
                        bg='lightgray.100'
                        p='0'
                        onClick={() => openDeleteModal(key)}
                      >
                        <Icon color='gray.300' fontSize={'xs'} as={FiTrash2} cursor='pointer' />
                      </Button>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        <Modal isOpen={showDeleteModal} onClose={onModalClose} isCentered>
          <ModalOverlay />
          <ModalContent borderRadius={16} boxShadow='0px 4px 16px rgba(38, 50, 56, 0.1)'>
            <ModalHeader pb={2}>
              <Text color='black' variant='header'>
                Delete Api Key?
              </Text>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text variant='paragraph' color='gray.300'>
                All related information will be lost, this action is permanent, and cannot be
                undone.
              </Text>
            </ModalBody>
            <ModalFooter>
              <PrimaryButton
                label='Delete'
                variant='emphasis'
                color='white'
                mr={3}
                onClick={deleteApiKey}
              ></PrimaryButton>
              <Button
                variant='outline'
                borderRadius={24}
                border='2px'
                px='22px'
                color='darkblue.100'
                borderColor='darkblue.100'
                _hover={{ bg: 'transparent' }}
                onClick={onModalClose}
              >
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Modal isOpen={showAddModal} onClose={onModalClose} isCentered>
          <ModalOverlay />
          <ModalContent borderRadius={16} boxShadow='0px 4px 16px rgba(38, 50, 56, 0.1)'>
            <ModalHeader pb={2}>
              <Text color='black' variant='header'>
                New Key
              </Text>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex direction='column' w='100%'>
                <Text variant='details' mb={1} color='black'>
                  Name
                </Text>
                <Input
                  borderRadius={8}
                  borderColor='gray.200'
                  type='text'
                  {...register('name' as const)}
                />
              </Flex>
            </ModalBody>
            <ModalFooter mt={4} textAlign='center'>
              <PrimaryButton
                disabled={!name}
                label='Create'
                variant='emphasis'
                color='white'
                onClick={createApiKey}
              ></PrimaryButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Section>
    </>
  )
}

export default SettingsApiKeys
