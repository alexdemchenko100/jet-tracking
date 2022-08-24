import { StatusPage } from '@httpmon/db'
import axios from 'axios'
import { useQuery } from 'react-query'
import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Grid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Icon,
  Image,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { FiEdit, FiTrash2 } from 'react-icons/fi'
import { Text, Section, PrimaryButton } from '../components'
import { Store } from '../services/Store'

interface StatusPageProps {
  data: StatusPage
  onDelete: (_: StatusPage) => void
}

function StatusPageTile({ data, onDelete }: StatusPageProps) {
  const navigate = useNavigate()

  return (
    <Box
      width='100%'
      borderRadius='8'
      border='1px'
      borderColor='gray.200'
      borderStyle='solid'
      boxShadow='0px 4px 16px rgba(224, 224, 224, 0.1)'
      overflow='hidden'
      p='3'
    >
      <Flex justify='space-between' alignItems='flex-start' gap={3}>
        <Image src={data.logoUrl} w={24} h={24} borderRadius={8} />
        <Flex flex={1} direction='column' alignSelf={'center'} gap={2} overflow='hidden'>
          <Text
            variant='header'
            color='black'
            textTransform='capitalize'
            transition='color 0.2s ease'
            textOverflow='ellipsis'
            overflow='hidden'
            whiteSpace='nowrap'
          >
            {data?.name}
          </Text>
          <a href={data?.siteUrl} target='_blank'>
            <Text
              variant='text-field'
              color='gray.300'
              textOverflow='ellipsis'
              overflow='hidden'
              whiteSpace='nowrap'
              mb={2}
            >
              {data?.siteUrl}
            </Text>
          </a>
        </Flex>
        <Button
          borderRadius='4'
          bg='lightgray.100'
          minW={8}
          h={8}
          p='0'
          onClick={() => navigate(`/console/status-pages/${data?.id}`)}
        >
          <Icon color='gray.300' fontSize={'sm'} as={FiEdit} cursor='pointer' />
        </Button>
        <Button
          borderRadius='4'
          minW={8}
          h={8}
          bg='lightgray.100'
          p='0'
          onClick={() => onDelete(data)}
        >
          <Icon color='gray.300' fontSize={'sm'} as={FiTrash2} cursor='pointer' />
        </Button>
      </Flex>
    </Box>
  )
}

export function StatusPages() {
  const navigate = useNavigate()
  const [selectedStatusPage, setSelectedStatusPage] = useState<StatusPage | undefined>()
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  useEffect(() => {
    document.title = 'Status Pages | ProAutoma'
  }, [])

  const { data: statusPages } = useQuery<StatusPage[], Error>(['status-pages'], async () => {
    let resp = await axios({
      method: 'GET',
      url: '/status-pages',
    })

    if (resp.status == 200) {
      return resp.data as StatusPage[]
    }
    throw Error('Failed to get odemand results')
  })

  const onModalClose = () => {
    setIsModalOpen(false)
    setSelectedStatusPage(undefined)
  }

  const openDeleteModal = (statusPage: StatusPage) => {
    setIsModalOpen(true)
    setSelectedStatusPage(statusPage)
  }

  const deleteStatusPage = async () => {
    await axios({
      method: 'DELETE',
      url: `/status-pages/${selectedStatusPage?.id}`,
    })
    Store.queryClient?.invalidateQueries(['status-pages'])
    onModalClose()
  }

  return (
    <Flex direction='column'>
      <Section>
        <Flex alignItems='center' justify={'space-between'}>
          <Text variant='header' color='black'>
            Status Pages
          </Text>
          <PrimaryButton
            label='New status page'
            variant='emphasis'
            color={'white'}
            onClick={() => navigate('/console/status-pages/new')}
          ></PrimaryButton>
        </Flex>
      </Section>
      <Section p={0} mb='0' display='flex' minH='calc(100vh - 320px)' flexDirection='column'>
        <Box p={4} pb={8} flex='1'>
          <Grid gap='6' templateColumns={{ sm: '1fr', xl: '1fr 1fr' }}>
            {statusPages?.map((statusPage) => (
              <StatusPageTile key={statusPage.id} data={statusPage} onDelete={openDeleteModal} />
            ))}
          </Grid>
        </Box>
      </Section>
      <Modal isOpen={isModalOpen} onClose={onModalClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius={16} boxShadow='0px 4px 16px rgba(38, 50, 56, 0.1)'>
          <ModalHeader pb={2}>
            <Text color='black' variant='header'>
              Delete Status Page
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text variant='text-field' color='gray.300'>
              Are you really sure to delete this status page?
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
              onClick={deleteStatusPage}
            ></PrimaryButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  )
}

export default StatusPages
