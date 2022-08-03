import { useState } from 'react'
import {
  Box,
  Flex,
  Input,
  Select,
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
  Badge,
} from '@chakra-ui/react'
import { FiEdit, FiTrash2, FiPlus, FiSend } from 'react-icons/fi'
import axios from 'axios'
import { useQuery } from 'react-query'
import { UserAccount } from '@httpmon/db'
import { Text, PrimaryButton, Section, SettingsHeader } from '../components'
import { useForm } from 'react-hook-form'

function SettingsUsers() {
  const toast = useToast()
  const [isInviteModalVisible, setInviteModalVisible] = useState<boolean>(false)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [selectedUser, setSelectedUser] = useState<UserAccount | undefined>()

  const { register, watch, reset, setValue } = useForm<UserAccount>()
  const email = watch('email')
  const role = watch('role')

  const { data: users, refetch: refetchUsers } = useQuery(['users'], async () => {
    const resp = await axios({
      method: 'GET',
      url: '/settings/users',
    })
    return resp.data
  })

  const onModalClose = () => {
    setShowDeleteModal(false)
    setShowEditModal(false)
    setInviteModalVisible(false)
    reset()
  }

  const openDeleteModal = (user?: UserAccount) => {
    setShowDeleteModal(true)
    setSelectedUser(user)
  }

  const onEditUser = (user: UserAccount) => {
    setShowEditModal(true)
    setSelectedUser(user)
    setValue('role', user?.role)
    setValue('email', user?.email)
  }

  const deleteUser = async () => {
    if (selectedUser?.role === 'notifications') {
      await axios.delete(`/settings/notifications/emails/${selectedUser.id}`)
    }
    toast({
      position: 'top',
      description: 'The user has been removed successfully.',
      status: 'info',
      duration: 2000,
    })
    refetchUsers()
    onModalClose()
    setSelectedUser(undefined)
  }

  async function sendInvite() {
    if (role === 'notifications') {
      await axios.post('/settings/notifications/emails', {
        email: email,
      })
      refetchUsers()
    }
    onModalClose()
    toast({
      position: 'top',
      description: 'New notification email has been added successfully.',
      status: 'success',
      duration: 2000,
    })
  }

  const resendVerifyLink = async (user: UserAccount) => {
    if (user.role === 'notifications') {
      await axios.post('/settings/notifications/emails/send-verification-mail', {
        email: email,
      })
    }
    toast({
      position: 'top',
      description: 'Email verification link was sent again to the email.',
      status: 'info',
      duration: 2000,
    })
  }

  const isFormValid = (): boolean => {
    if (!email || !role) {
      return false
    }
    if (
      email &&
      !email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    ) {
      return false
    }
    return true
  }

  return (
    <>
      <SettingsHeader formChanged={false} resetForm={() => {}}></SettingsHeader>
      <Section width='100%' pb={10} minH='96'>
        <Flex alignItems='center' justifyContent='flex-end'>
          <Button px={0} variant='unstyled' onClick={() => setInviteModalVisible(true)}>
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
                Invite User
              </Text>
            </Flex>
          </Button>
        </Flex>
        <Box overflowX='auto'>
          <Table variant='simple' mt={6}>
            <Thead>
              <Tr>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th align='right'>&nbsp;</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users?.map((user: UserAccount) => (
                <Tr key={user.id}>
                  <Td>{user.email}</Td>
                  <Td textTransform='capitalize'>{user.role}</Td>
                  <Td textTransform='capitalize'>
                    {user.status === 'verified' && (
                      <Badge variant='solid' colorScheme='green'>
                        {user.status}
                      </Badge>
                    )}
                    {user.status === 'unverified' && (
                      <Badge variant='solid' colorScheme='red'>
                        {user.status}
                      </Badge>
                    )}
                    {user.status === 'expired' && (
                      <Badge variant='solid' colorScheme='yellow'>
                        {user.status}
                      </Badge>
                    )}
                  </Td>
                  <Td>
                    <Flex alignItems='center' gap={2} justifyContent='flex-end'>
                      {user.status === 'expired' && (
                        <Button
                          w={6}
                          h={6}
                          minW={6}
                          borderRadius='4'
                          bg='lightgray.100'
                          p='0'
                          onClick={() => resendVerifyLink(user)}
                        >
                          <Icon color='darkgray.100' fontSize={'xs'} as={FiSend} cursor='pointer' />
                        </Button>
                      )}
                      <Button
                        w={6}
                        h={6}
                        minW={6}
                        borderRadius='4'
                        bg='lightgray.100'
                        p='0'
                        onClick={() => onEditUser(user)}
                      >
                        <Icon color='gray.300' fontSize={'xs'} as={FiEdit} cursor='pointer' />
                      </Button>
                      <Button
                        w={6}
                        h={6}
                        minW={6}
                        borderRadius='4'
                        bg='lightgray.100'
                        p='0'
                        onClick={() => openDeleteModal(user)}
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
                Delete user?
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
                onClick={deleteUser}
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
        <Modal isOpen={isInviteModalVisible} onClose={onModalClose} isCentered>
          <ModalOverlay />
          <ModalContent borderRadius={16} boxShadow='0px 4px 16px rgba(38, 50, 56, 0.1)'>
            <ModalHeader pb={2}>
              <Text color='black' variant='header'>
                Send Invitation
              </Text>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex direction='column' w='100%'>
                <Text variant='details' mb={1} color='black'>
                  Email
                </Text>
                <Input
                  borderRadius={8}
                  borderColor='gray.200'
                  type='email'
                  {...register('email' as const)}
                />
              </Flex>
              <Flex direction='column' w='100%' mt={4}>
                <Text variant='details' mb={1} color='black'>
                  Role
                </Text>
                <Select borderRadius={8} borderColor='gray.200' {...register('role' as const)}>
                  <option value=''>Please select a user role</option>
                  <option value='owner' disabled>
                    Owner
                  </option>
                  <option value='admin' disabled>
                    Admin
                  </option>
                  <option value='viewer' disabled>
                    Viewer
                  </option>
                  <option value='notifications'>Notifications</option>
                </Select>
              </Flex>
            </ModalBody>
            <ModalFooter mt={4} textAlign='center'>
              <PrimaryButton
                disabled={!isFormValid()}
                label='Send'
                variant='emphasis'
                color='white'
                onClick={sendInvite}
              ></PrimaryButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Modal isOpen={showEditModal} onClose={onModalClose} isCentered>
          <ModalOverlay />
          <ModalContent borderRadius={16} boxShadow='0px 4px 16px rgba(38, 50, 56, 0.1)'>
            <ModalHeader pb={2}>
              <Text color='black' variant='header'>
                Edit User
              </Text>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex direction='column' w='100%'>
                <Text variant='details' mb={1} color='black'>
                  Email
                </Text>
                <Input
                  borderRadius={8}
                  borderColor='gray.200'
                  readOnly
                  type='email'
                  {...register('email' as const)}
                />
              </Flex>
              <Flex direction='column' w='100%' mt={4}>
                <Text variant='details' mb={1} color='black'>
                  Role
                </Text>
                <Select borderRadius={8} borderColor='gray.200' {...register('role' as const)}>
                  <option value='owner' disabled>
                    Owner
                  </option>
                  <option value='admin' disabled>
                    Admin
                  </option>
                  <option value='viewer' disabled>
                    Viewer
                  </option>
                  <option value='notifications'>Notifications</option>
                </Select>
              </Flex>
            </ModalBody>
            <ModalFooter mt={4} textAlign='center'>
              <PrimaryButton
                label='Cancel'
                isOutline
                variant='emphasis'
                color='darkblue.100'
                onClick={onModalClose}
                mr={2}
              ></PrimaryButton>
              <PrimaryButton
                disabled={!isFormValid()}
                label='Update'
                variant='emphasis'
                color='white'
                onClick={onModalClose}
              ></PrimaryButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Section>
    </>
  )
}

export default SettingsUsers
