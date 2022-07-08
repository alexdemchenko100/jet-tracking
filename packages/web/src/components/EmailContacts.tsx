import { useEffect, useState } from 'react'
import {
  Flex,
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
  Grid,
  Input,
  Radio,
  RadioGroup,
  Stack,
} from '@chakra-ui/react'
import axios from 'axios'
import { FiSend, FiTrash2, FiPlus } from 'react-icons/fi'
import { NotificationEmail } from '@httpmon/db'
import { useForm } from 'react-hook-form'
import { useQuery } from 'react-query'

import { Section, Text, PrimaryButton } from '../components'
import { Store } from '../services/Store'

const EmailContacts = () => {
  const toast = useToast()
  const [selectedEmail, setSelectedEmail] = useState<string | undefined>()
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false)
  const [status, setStatus] = useState<string>('verified')

  const { register, watch, reset } = useForm<NotificationEmail>()

  const email = watch('email')

  const { data: notificationEmails, refetch } = useQuery(['notificaitonEmails'], async () => {
    const resp = await axios({
      method: 'GET',
      url: '/settings/notifications/emails',
      params: {
        status,
      },
    })
    return resp.data
  })

  useEffect(() => {
    refetch()
  }, [status])

  const onModalClose = () => {
    setShowDeleteModal(false)
    setShowCreateModal(false)
  }

  const openDeleteModal = (id: string | undefined) => {
    if (id) {
      setShowDeleteModal(true)
      setSelectedEmail(id)
    }
  }

  const deleteEmail = () => {
    axios.delete(`/settings/notifications/emails/${selectedEmail}`).then(() => {
      toast({
        position: 'top',
        description: 'Notification email has been removed successfully.',
        status: 'info',
        duration: 2000,
      })
      onModalClose()
      refetch()
      setSelectedEmail(undefined)
      console.log('-----------queryClient', Store.queryClient)
      Store.queryClient?.invalidateQueries(['notifications'])
    })
  }

  async function saveNewEmail() {
    await axios.post('/settings/notifications/emails', {
      email: email,
    })
    onModalClose()
    toast({
      position: 'top',
      description: 'New notification email has been added successfully.',
      status: 'success',
      duration: 2000,
    })
    refetch()
    reset()
  }

  const resendVerifyLink = async (id?: string) => {}

  return (
    <Section pt={4} pb={6} minH={60}>
      <Flex alignItems='center' justifyContent='space-between'>
        <Text variant='title' color='black'>
          Email Contacts
        </Text>
        <Button px={0} variant='unstyled' onClick={() => setShowCreateModal(true)}>
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
              New Email
            </Text>
          </Flex>
        </Button>
      </Flex>
      <RadioGroup onChange={setStatus} value={status}>
        <Stack direction='row'>
          <Radio value='verified' colorScheme='cyan' _focus={{ boxShadow: 'none' }} p={2}>
            Verified
          </Radio>
          <Radio value='unverified' colorScheme='cyan' _focus={{ boxShadow: 'none' }} p={2}>
            Unverified
          </Radio>
          <Radio value='expired' colorScheme='cyan' _focus={{ boxShadow: 'none' }} p={2}>
            Expired
          </Radio>
        </Stack>
      </RadioGroup>
      {notificationEmails && notificationEmails.length > 0 ? (
        <Grid templateColumns={{ sm: '1fr', xl: '1fr 1fr' }} gap={4} mt={4}>
          {notificationEmails.map((notificationEmail: NotificationEmail) => (
            <Flex
              borderWidth='1px'
              borderColor={'gray.200'}
              borderStyle='solid'
              borderRadius={8}
              px={4}
              py={2}
              alignItems='center'
              maxW={'600px'}
              key={notificationEmail.email}
              gap={2}
            >
              <Text
                variant='text-field'
                textOverflow='ellipsis'
                overflow='hidden'
                whiteSpace='nowrap'
                color='gray.300'
                flex='1'
              >
                {notificationEmail.email}
              </Text>
              {status === 'expired' && (
                <Button
                  w={6}
                  h={6}
                  minW={6}
                  borderRadius='4'
                  bg='lightgray.100'
                  p='0'
                  onClick={() => resendVerifyLink(notificationEmail.id)}
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
                onClick={() => openDeleteModal(notificationEmail.id)}
              >
                <Icon color='gray.300' fontSize={'xs'} as={FiTrash2} cursor='pointer' />
              </Button>
            </Flex>
          ))}
        </Grid>
      ) : (
        <Flex py={10} justifyContent='center'>
          <Text variant='paragraph' color='gray.300'>
            There is no {status} emails yet.
          </Text>
        </Flex>
      )}
      <Modal isOpen={showDeleteModal} onClose={onModalClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius={16} boxShadow='0px 4px 16px rgba(38, 50, 56, 0.1)'>
          <ModalHeader pb={2}>
            <Text color='black' variant='header'>
              Delete Email?
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text variant='paragraph' color='gray.300'>
              All related information will be lost, this action is permanent, and cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <PrimaryButton
              label='Cancel'
              variant='emphasis'
              color='darkblue.100'
              mr={3}
              isOutline
              onClick={onModalClose}
            ></PrimaryButton>
            <PrimaryButton
              label='Delete'
              variant='emphasis'
              color='white'
              onClick={deleteEmail}
            ></PrimaryButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={showCreateModal} onClose={onModalClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius={16} boxShadow='0px 4px 16px rgba(38, 50, 56, 0.1)'>
          <ModalHeader pb={2}>
            <Text color='black' variant='header'>
              Add Email Contact
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
          </ModalBody>
          <ModalFooter mt={6}>
            <PrimaryButton
              disabled={!email}
              label='Cancel'
              isOutline
              variant='emphasis'
              color='darkblue.100'
              mr={3}
              onClick={onModalClose}
            ></PrimaryButton>
            <PrimaryButton
              disabled={!email}
              label='Save'
              variant='emphasis'
              color='white'
              onClick={saveNewEmail}
            ></PrimaryButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Section>
  )
}

export default EmailContacts
