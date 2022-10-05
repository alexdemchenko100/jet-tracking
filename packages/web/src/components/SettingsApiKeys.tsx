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
import dayjs from 'dayjs'

function SettingsApiKeys() {
  const toast = useToast()

  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | undefined>()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [token, setToken] = useState<string>('')

  const { register, watch, reset } = useForm<ApiKey>()
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
    setToken('')
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
        setToken(res.data.token)
      })
      .catch((error: AxiosError) => {
        toast({
          position: 'top',
          description: error.response?.data.message,
          status: 'error',
          duration: 2000,
        })
      })
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      position: 'top',
      description: 'Api Token has been copied to clipboard!',
      status: 'info',
      duration: 2000,
    })
    onModalClose()
  }

  return (
    <>
      <SettingsHeader title='API Keys'></SettingsHeader>
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
                Create New Key
              </Text>
            </Flex>
          </Button>
        </Flex>
        <Box overflowX='auto'>
          <Table variant='simple' mt={6}>
            <Thead>
              <Tr>
                <Th>Created</Th>
                <Th>Name</Th>
                <Th>Tag (Key suffix)</Th>
                <Th align='right'>&nbsp;</Th>
              </Tr>
            </Thead>
            <Tbody>
              {apiKeys?.map((key: ApiKey) => (
                <Tr key={key.id}>
                  <Td whiteSpace='nowrap'>{dayjs(key.createdAt).format('MMM DD hh:mm')}</Td>
                  <Td>{key.name}</Td>
                  <Td>
                    <Box display='inline' letterSpacing={2}>
                      ...
                    </Box>
                    {key.tag}
                  </Td>
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
              {token == '' ? (
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
              ) : (
                <Flex direction='column' w='100%'>
                  <Text variant='details' mb={1} color='black'>
                    API Key
                  </Text>
                  <Flex alignItems='center' borderRadius={4} bg='lightgray.100' py='2' px='2'>
                    <Text flex='1' variant='paragraph' fontSize={14} color='gray'>
                      {token}
                    </Text>
                    <Icon color='gray.300' fontSize={'sm'} as={FiClipboard} cursor='pointer' />
                  </Flex>
                  <Text variant='details' mb={1} color='black'>
                    This is only time you will be able to see the key!! Please copy and safely store
                    it.
                  </Text>
                </Flex>
              )}
            </ModalBody>
            <ModalFooter mt={4} textAlign='center'>
              {token == '' ? (
                <PrimaryButton
                  disabled={!name}
                  label='Create'
                  variant='emphasis'
                  color='white'
                  onClick={createApiKey}
                ></PrimaryButton>
              ) : (
                <PrimaryButton
                  disabled={!name}
                  label='Close - Copies to clipboard'
                  variant='emphasis'
                  color='white'
                  onClick={() => copyToClipboard(token)}
                ></PrimaryButton>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Section>
    </>
  )
}

export default SettingsApiKeys
