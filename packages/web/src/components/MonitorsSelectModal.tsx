import { useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Icon,
  Grid,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
} from '@chakra-ui/react'
import axios from 'axios'
import { PrimaryButton, Text } from '../components'
import { Monitor } from '@httpmon/db'
import { useQuery } from 'react-query'
import { CgChevronLeft, CgChevronRight } from 'react-icons/cg'
import {
  Pagination,
  PaginationPrevious,
  PaginationNext,
  PaginationPageGroup,
  PaginationContainer,
  PaginationPage,
  usePagination,
} from '@ajna/pagination'

interface Props {
  onChange: (_: Monitor[]) => void
  onClose: () => void
  isModalOpen: boolean
  disabledItems: Monitor[]
}

function MonitorsSelectModal({ isModalOpen, onClose, onChange, disabledItems }: Props) {
  const [selectedMons, setSelectedMons] = useState<Monitor[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const { pages, pagesCount, pageSize, setPageSize, currentPage, setCurrentPage } = usePagination({
    total: totalCount,
    initialState: {
      pageSize: 16,
      currentPage: 1,
    },
  })

  async function getMonitors() {
    let resp = await axios({
      method: 'GET',
      url: '/monitors',
      params: {
        offset: (currentPage - 1) * 10,
        limit: 10,
      },
    })

    if (resp.status == 200) {
      const results = resp.data.items as Monitor[]
      setTotalCount(resp.data.total)
      return results
    }
    throw Error('Failed to get odemand results')
  }

  const {
    isLoading,
    data: monitors,
    error,
  } = useQuery<Monitor[]>(['monitors-list', currentPage], () => getMonitors(), {})

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const selectMon = () => {
    if (selectedMons.length > 0) {
      onChange(selectedMons)
      onClose()
    }
  }

  const isDisabled = (monitor: Monitor) => {
    return disabledItems.findIndex((item) => item.id === monitor.id) > -1
  }

  const changeSelect = (monitor: Monitor) => {
    const arr = selectedMons.slice()
    const index = arr.findIndex((item) => item.id === monitor.id)
    if (index > -1) {
      arr.splice(index, 1)
    } else {
      arr.push(monitor)
    }
    setSelectedMons(arr)
  }

  return (
    <Modal isOpen={isModalOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent borderRadius={16} boxShadow='0px 4px 16px rgba(38, 50, 56, 0.1)'>
        <ModalHeader pb={2}>
          <Text color='black' variant='header'>
            Monitors
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Grid templateColumns={'1fr 1fr'} mt={4} gap={4}>
            {monitors?.map((monitor) => (
              <Checkbox
                key={monitor.id}
                colorScheme='cyan'
                borderRadius={4}
                width={'100%'}
                isDisabled={isDisabled(monitor)}
                onChange={() => changeSelect(monitor)}
              >
                <Text variant='text-field' color='gray.300'>
                  {monitor.name}
                </Text>
              </Checkbox>
            ))}
          </Grid>
          <Flex my={6}>
            <Spacer></Spacer>
            <Box>
              <Pagination
                currentPage={currentPage}
                pagesCount={pagesCount}
                onPageChange={handlePageChange}
              >
                <PaginationContainer align='center' justify='space-between' gap={2} w='full'>
                  <PaginationPrevious
                    isDisabled={currentPage === 1}
                    bg='transparent'
                    p={0}
                    w={4}
                    minW={4}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <Icon as={CgChevronLeft} color='darkblue.100'></Icon>
                  </PaginationPrevious>
                  <PaginationPageGroup isInline align='center'>
                    {pages.map((page: number) => (
                      <PaginationPage
                        key={`pagination_page_${page}`}
                        _current={{
                          color: 'darkblue.100',
                        }}
                        color='darkgray.100'
                        bg='transparent'
                        fontSize='sm'
                        page={page}
                        onClick={() => setCurrentPage(page)}
                      />
                    ))}
                  </PaginationPageGroup>
                  <PaginationNext
                    bg='transparent'
                    p={0}
                    pr={0.5}
                    w={4}
                    minW={4}
                    isDisabled={currentPage === pagesCount}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <Icon as={CgChevronRight} color='darkblue.100'></Icon>
                  </PaginationNext>
                </PaginationContainer>
              </Pagination>
            </Box>
            <Spacer></Spacer>
          </Flex>
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
            onClick={onClose}
          >
            Cancel
          </Button>
          <PrimaryButton
            label='Select'
            disabled={!selectedMons.length}
            variant='emphasis'
            color='white'
            onClick={selectMon}
          ></PrimaryButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default MonitorsSelectModal
