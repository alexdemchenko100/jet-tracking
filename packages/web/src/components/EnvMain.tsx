import {
  Box,
  Flex,
  Button,
  Icon,
  useToast,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Grid,
} from '@chakra-ui/react'
import { MonEnv } from '@httpmon/db'
import axios from 'axios'
import { useState } from 'react'
import { FiEdit, FiTrash2 } from 'react-icons/fi'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { PrimaryButton, Section, Text } from '../components'
import GlobalEnvs from './GlobalEnvs'

export default function EnvMain() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [env, setEnv] = useState<string | undefined>()

  const navigate = useNavigate()
  const toast = useToast()

  const { data: envs, refetch } = useQuery<MonEnv[]>(['monenv'], async () => {
    const resp = await axios({
      method: 'GET',
      url: `/environments`,
    })
    return resp.data as MonEnv[]
  })

  const onModalClose = () => {
    setIsModalOpen(false)
  }

  const onOpenModal = (id?: string) => {
    if (id) {
      setEnv(id)
      setIsModalOpen(true)
    }
  }

  const deleteEnv = () => {
    axios({
      method: 'DELETE',
      url: `/environments/${env}`,
    }).then(() => {
      toast({
        position: 'top',
        description: 'The env has been removed successfully.',
        status: 'success',
        duration: 2000,
      })
      onModalClose()
      setIsModalOpen(false)
      refetch()
    })
  }

  return (
    <Flex flexDir='column' w='100%'>
      <Section w='100%' py='4'>
        <GlobalEnvs />
      </Section>
      <Section w='100%' minH='80' py='8'>
        {envs?.length === 0 && (
          <Text as='div' py='40' textAlign='center' variant='paragraph' color='gray.300'>
            No environments.
          </Text>
        )}
        <Grid gap={4} templateColumns={'1fr'} maxW={1000}>
          {envs?.map((env) => (
            <Box
              key={env.id}
              data-label={env.name}
              width='100%'
              borderRadius='8'
              border='1px'
              borderColor='gray.200'
              borderStyle='solid'
              boxShadow='0px 4px 16px rgba(224, 224, 224, 0.1)'
              overflow='hidden'
              p='3'
            >
              <Flex justify='space-between' alignItems='center'>
                <Flex direction='column' gap={1}>
                  <Text
                    variant='title'
                    color='black'
                    textTransform='capitalize'
                    transition='color 0.2s ease'
                    textOverflow='ellipsis'
                    overflow='hidden'
                    whiteSpace='nowrap'
                  >
                    {env.name}
                  </Text>
                  <Text variant='details' color='gray.300'>
                    {env.env.length} variable{env.env.length > 1 ? 's' : ''}
                  </Text>
                </Flex>
                <Flex gap={2} alignItems='center'>
                  <Button
                    className='env-details-btn'
                    borderRadius='4'
                    bg='lightgray.100'
                    minW={8}
                    h={8}
                    p='0'
                    onClick={() => navigate(`/console/envs/${env.id}`)}
                  >
                    <Icon color='gray.300' fontSize={'sm'} as={FiEdit} cursor='pointer' />
                  </Button>
                  <Button
                    className='env-delete-btn'
                    borderRadius='4'
                    minW={8}
                    h={8}
                    bg='lightgray.100'
                    p='0'
                    onClick={() => onOpenModal(env.id)}
                  >
                    <Icon color='gray.300' fontSize={'sm'} as={FiTrash2} cursor='pointer' />
                  </Button>
                </Flex>
              </Flex>
            </Box>
          ))}
        </Grid>
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
    </Flex>
  )
}
