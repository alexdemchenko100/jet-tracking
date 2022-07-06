import {
  Flex,
  Box,
  Input,
  Divider,
  Button,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react'
import { MonEnv } from '@httpmon/db'
import { useQuery } from 'react-query'
import { useState } from 'react'
import { FiEdit, FiTrash2 } from 'react-icons/fi'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

import { PrimaryButton, Section, Text } from '../components'

export default function EnvView() {
  const { id } = useParams()
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const navigate = useNavigate()
  const toast = useToast()

  const { isLoading, data: monEnv } = useQuery<MonEnv>(['monenv', id], async () => {
    const resp = await axios({
      method: 'GET',
      url: `/environments/${id}`,
    })
    return resp.data as MonEnv
  })

  const onModalClose = () => {
    setIsModalOpen(false)
  }

  const deleteEnv = () => {
    axios({
      method: 'DELETE',
      url: `/environments/${id}`,
    }).then(() => {
      toast({
        position: 'top',
        description: 'The env has been removed successfully.',
        status: 'success',
        duration: 2000,
      })
      onModalClose()
      setIsModalOpen(false)
      navigate('/console/envs')
    })
  }

  if (isLoading) {
    return <>Loading...</>
  }

  return (
    <Section py={4} w='100%' minH='80'>
      <Flex justify='start' gap={4} direction='column'>
        <Flex alignItems='center' justifyContent='space-between'>
          <Text variant='title' color='black'>
            {monEnv?.name}
          </Text>
          <Flex gap={2}>
            <Button
              w={7}
              h={7}
              minW={6}
              borderRadius='4'
              bg='lightgray.100'
              p='0'
              onClick={() => setIsModalOpen(true)}
            >
              <Icon color='gray.300' as={FiTrash2} cursor='pointer' />
            </Button>
            <Button
              w={7}
              h={7}
              minW={6}
              borderRadius='4'
              bg='lightgray.100'
              p='0'
              onClick={() => navigate(`/console/envs/${id}/edit`)}
            >
              <Icon color='darkgray.100' as={FiEdit} cursor='pointer' />
            </Button>
          </Flex>
        </Flex>
        <Divider />
        <Box mt='2'>
          {monEnv?.env.map((item, index) => (
            <Flex key={`${monEnv.id}-${index}`} alignItems='flex-end' mb='4' gap={4}>
              <Box w={96}>
                <Text variant='details' color='black'>
                  Name
                </Text>
                <Input type='text' key={item[0]} defaultValue={item[0]} color='gray.300' readOnly />
              </Box>
              <Box w={96}>
                <Text variant='details' color='black'>
                  Value
                </Text>
                <Input type='text' key={item[1]} defaultValue={item[1]} color='gray.300' readOnly />
              </Box>
            </Flex>
          ))}
        </Box>
      </Flex>
      <Modal isOpen={isModalOpen} onClose={onModalClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius={16} boxShadow='0px 4px 16px rgba(38, 50, 56, 0.1)'>
          <ModalHeader pb={2}>
            <Text color='black' variant='header'>
              Delete Env
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text variant='text-field' color='gray.300'>
              Are you really sure to delete this env?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant='outline'
              borderRadius={24}
              border='2px'
              px='22px'
              color='darkblue.100'
              borderColor='darkblue.100'
              _hover={{ bg: 'transparent' }}
              mr={3}
              onClick={onModalClose}
            >
              Cancel
            </Button>
            <PrimaryButton
              label='Delete'
              variant='emphasis'
              color='white'
              onClick={deleteEnv}
            ></PrimaryButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Section>
  )
}
