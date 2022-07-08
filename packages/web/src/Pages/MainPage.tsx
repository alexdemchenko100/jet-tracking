import { Monitor, MonitorStats } from '@httpmon/db'
import axios from 'axios'
import { useQuery } from 'react-query'
import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Icon,
  Tooltip,
  Select,
  Grid,
  TableContainer,
  Table,
  Thead,
  Tr,
  Td,
  Th,
  Tbody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  FiEdit,
  FiTrendingUp,
  FiTrendingDown,
  FiPause,
  FiGrid,
  FiList,
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
} from 'react-icons/fi'
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
import { Text, Section, PrimaryButton, StatusUpOrDown, NewMonitorHero } from '../components'
import { Store } from '../services/Store'

interface StatusProps {
  mon?: Monitor
  stats?: MonitorStats
}

interface IFormInputs {
  filter: string
  sortBy: string
}

interface StatsSummary {
  up?: number
  down?: number
  paused?: number
}

interface StatBoxProps {
  status: string
  stats?: MonitorStats[]
}

interface MonitorListProps {
  mon?: Monitor
  stats?: MonitorStats
  onDelete: (mon: string) => void
}

const uptime24 = (m: MonitorStats) => {
  if (m.day?.numItems > 0) {
    return Math.round(((m.day.numItems - m.day.numErrors) / m.day.numItems) * 100 * 100) / 100
  } else {
    return 0
  }
}

function RunChart({ stats, narrowMode }: { stats?: MonitorStats; narrowMode?: boolean }) {
  const navigate = useNavigate()
  if (!stats || !stats.lastResults) {
    return <></>
  }

  const p50 = stats.day.p50
  const p95 = stats.day.p95
  const times = narrowMode ? 0.8 : 1

  return (
    <Flex gap={narrowMode ? '1' : '2'} alignItems='baseline' maxW={'430px'} height='auto'>
      {stats.lastResults.map((r) => (
        <Tooltip
          borderRadius='4'
          bg='darkgray.100'
          py={0.5}
          px={1.5}
          fontSize='sm'
          fontWeight='600'
          label={'Time - ' + r.totalTime + 'ms'}
          key={r.id}
        >
          <Box
            key={r.id}
            w='1.5'
            h={`${
              r.totalTime > p50 ? (r.totalTime > p95 ? 28 * times : 24 * times) : 20 * times
            }px`}
            bgColor={stats.status === 'paused' ? 'gold.200' : r.err ? 'red.200' : 'green.200'}
            borderRadius='4'
            _hover={{
              w: narrowMode ? '1.5' : '2',
            }}
            onClick={(e) => {
              e.stopPropagation()
              navigate('/console/apiruns/' + r.id)
            }}
          />
        </Tooltip>
      ))}
    </Flex>
  )
}

function MonitorStatusCard({ mon, stats }: StatusProps) {
  const navigate = useNavigate()

  return (
    <Flex
      flexDirection='column'
      width='100%'
      borderRadius='8'
      border='1px'
      borderColor='gray.200'
      borderStyle='solid'
      boxShadow='0px 4px 16px rgba(224, 224, 224, 0.1)'
      bgColor='white'
      p='6'
      pb='5'
      justifyContent='begin'
    >
      <Flex justify='space-between' alignItems='center' mb={2}>
        <Flex
          alignItems='center'
          cursor='pointer'
          onClick={() => navigate(`/console/monitors/${mon?.id}`)}
        >
          <Text
            variant='header'
            color='black'
            _hover={{ color: 'darkblue.100', textDecoration: 'underline' }}
            transition='color 0.2s ease'
          >
            {mon?.name}
          </Text>
          <StatusUpOrDown stats={stats} />
        </Flex>
        <Button
          borderRadius='4'
          bg='lightgray.100'
          p='0'
          onClick={() => navigate(`/console/monitors/${mon?.id}/edit`)}
        >
          <Icon color='gray.300' as={FiEdit} cursor='pointer' />
        </Button>
      </Flex>
      <Text
        variant='text-field'
        color='gray.300'
        textOverflow='ellipsis'
        overflow='hidden'
        whiteSpace='nowrap'
      >
        {mon?.url}
      </Text>
      <Box mt={4} w={8} h={1} bg='gray.200' borderRadius='2'></Box>
      <Box my={5}>
        <RunChart stats={stats} />
      </Box>
      <Flex>
        <Flex flexDirection={'column'} mr={10}>
          <Text variant='emphasis' color='black' mb={2}>
            UPTIME
          </Text>
          <Text variant='emphasis' color='gray.300'>
            {mon?.uptime + '%'}
          </Text>
        </Flex>

        <Flex flexDirection={'column'} mr={10}>
          <Text variant='emphasis' color='black' mb={2}>
            24Hr AVG
          </Text>
          <Text variant='emphasis' color='gray.300'>
            {stats?.day.avg.toFixed(2)}
          </Text>
        </Flex>

        <Flex flexDirection={'column'} mr={10}>
          <Text variant='emphasis' color='black' mb={2}>
            24Hr MEDIAN
          </Text>
          <Text variant='emphasis' color='gray.300'>
            {stats?.day.p50.toFixed(2)}
          </Text>
        </Flex>

        <Flex flexDirection={'column'}>
          <Text variant='emphasis' color='black' mb={2}>
            24 Hr P95
          </Text>
          <Text variant='emphasis' color='gray.300'>
            {stats?.day.p95.toFixed(2)}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  )
}

function getMonitorCountByStatus(status: string, stats?: MonitorStats[]) {
  if (!stats) return 0

  switch (status) {
    case 'up':
      return stats.filter((entry) => entry.status === 'up').length
      break
    case 'down':
      return stats.filter((entry) => entry.status === 'down').length
      break

    case 'paused':
      return stats.filter((entry) => entry.status === 'paused').length
      break
  }
  return 0
}

const StatBox = ({ status, stats }: StatBoxProps) => {
  let bgColor
  switch (status) {
    case 'up':
      bgColor = 'green.200'
      break
    case 'down':
      bgColor = 'red.200'
      break
    case 'paused':
      bgColor = 'gold.200'
      break
    default:
  }
  return (
    <Flex
      px={{ sm: 2, lg: 4 }}
      py={2}
      flex={1}
      borderRadius={8}
      borderWidth={1}
      borderColor='gray.200'
      borderStyle='solid'
    >
      <Flex
        width={10}
        mr={{ sm: 2, lg: 4 }}
        height={10}
        alignItems='center'
        justifyContent='center'
        borderRadius={8}
        bg={bgColor}
      >
        {status === 'up' && <Icon color='white' as={FiTrendingUp} />}
        {status === 'down' && <Icon color='white' as={FiTrendingDown} />}
        {status === 'paused' && <Icon color='white' fill='white' as={FiPause} />}
      </Flex>
      <Flex direction={'column'}>
        <Text variant='text-field' color='gray.300' mb={1} textTransform='capitalize'>
          Total {status}
        </Text>
        <Text variant='emphasis' color='black'>
          {getMonitorCountByStatus(status, stats)}
        </Text>
      </Flex>
    </Flex>
  )
}

const MonitorListItem = ({ mon, stats, onDelete }: MonitorListProps) => {
  const navigate = useNavigate()

  if (!mon || !stats) return <></>

  return (
    <Tr bg={stats.status === 'paused' ? 'rgba(219, 219, 219, 0.3)' : ''}>
      <Td px={4} py={2}>
        <Text
          cursor='pointer'
          variant='text-field'
          color='darkblue.100'
          onClick={() => navigate(`/console/monitors/${mon.id}`)}
        >
          {mon.name}
        </Text>
      </Td>
      <Td px={4} py={2}>
        <Flex alignItems='center' gap={2}>
          {mon.status === 'paused' && (
            <>
              <Icon color='gold.200' fill='gold.200' as={FiPause} />
              <Text variant='text-field' color='gray.300'>
                Paused
              </Text>
            </>
          )}
          {mon.status === 'up' && (
            <>
              <Icon color='darkblue.100' as={FiTrendingUp} />
              <Text variant='text-field' color='gray.300'>
                Up
              </Text>
            </>
          )}
          {mon.status === 'down' && (
            <>
              <Icon color='red.200' as={FiTrendingDown} />
              <Text variant='text-field' color='gray.300'>
                Down
              </Text>
            </>
          )}
        </Flex>
      </Td>
      <Td px={4} py={2}>
        <RunChart stats={stats} narrowMode />
      </Td>
      <Td px={4} py={2}>
        <Text variant='text-field' color='gray.300'>
          {mon.uptime + '%'}
        </Text>
      </Td>
      <Td px={4} py={2}>
        <Text variant='text-field' color='gray.300'>
          {mon.dayAvg?.toFixed(2)}
        </Text>
      </Td>
      <Td px={4} py={2}>
        <Text variant='text-field' color='gray.300'>
          {mon.day50?.toFixed(2)}
        </Text>
      </Td>
      <Td px={4} py={2}>
        <Text variant='text-field' color='gray.300'>
          {stats?.day.p95.toFixed(2)}
        </Text>
      </Td>
      <Td textAlign='center' px={4} py={2}>
        <Flex gap={2} alignItems='center' justifyContent='center'>
          <Button
            borderRadius='4'
            bg='lightgray.100'
            color=''
            w={7}
            h={7}
            p={0}
            minW={7}
            onClick={() => onDelete(mon?.id || '')}
          >
            <Icon color='gray.300' fontSize='sm' as={FiTrash2} cursor='pointer' />
          </Button>
          <Button
            borderRadius='4'
            bg='lightgray.100'
            w={7}
            h={7}
            p={0}
            minW={7}
            onClick={() => navigate(`/console/monitors/${mon?.id}/edit`)}
          >
            <Icon color='gray.300' fontSize='sm' as={FiEdit} cursor='pointer' />
          </Button>
        </Flex>
      </Td>
    </Tr>
  )
}

const SortIcons = () => (
  <Flex flexDirection='column' cursor='pointer'>
    <Icon as={FiChevronUp} fontSize='sm' color='darkblue.100'></Icon>
    <Icon as={FiChevronDown} fontSize='sm' color='darkblue.100'></Icon>
  </Flex>
)

export function MainPage() {
  const navigate = useNavigate()
  const [filterOption, setFilterOption] = useState<string | undefined>(undefined)
  const { register, watch } = useForm<IFormInputs>()
  const [isGridView, setIsGridView] = useState<boolean>(Store.UIState.monitors.isGridView)
  const [sortOption, setSortOption] = useState<string>('')
  const [sortDir, setSortDir] = useState<string>('asc')
  const [sortedMonitors, setSortedMonitors] = useState<Monitor[]>([])
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [selectedMonitor, setSelectedMonitor] = useState<string | undefined>()
  const { pages, pagesCount, pageSize, setPageSize, currentPage, setCurrentPage } = usePagination({
    total: totalCount,
    initialState: {
      pageSize: 16,
      currentPage: 1,
    },
  })

  watch()

  useEffect(() => {
    document.title = 'Dashboard | ProAutoma'
  }, [])

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'filter') {
        setFilterOption(value.filter)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  async function getMonitors(page: number = 1, limit: number = 16) {
    let resp = await axios({
      method: 'GET',
      url: '/monitors',
      params: {
        offset: (page - 1) * limit,
        limit: limit,
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

  async function getMonitorStats() {
    let resp = await axios({
      method: 'GET',
      url: '/monitors/stats',
    })

    if (resp.status == 200) {
      return resp.data as MonitorStats[]
    }
    throw Error('Failed to get odemand results')
  }

  const { data: stats } = useQuery<MonitorStats[], Error>(['monitors-stats', currentPage], () =>
    getMonitorStats()
  )

  useEffect(() => {
    if (monitors && stats) {
      monitors.forEach((monitor) => {
        const statsData = stats.find((stat) => monitor.id === stat.monitorId)
        if (statsData) {
          monitor.status = statsData.status
          monitor.uptime = uptime24(statsData)
          monitor.day50 = statsData.day.p50
          monitor.dayAvg = statsData.day.avg
        }
      })
      setSortedMonitors(monitors)
    }
  }, [monitors, stats])

  if (monitors && monitors.length == 0) {
    return <NewMonitorHero />
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(event.target.value)
    setPageSize(value)
  }

  const sortBy = (field: string) => {
    const data = monitors?.slice() || []

    switch (field) {
      case 'name':
        data.sort((a: Monitor, b: Monitor) => (a.name > b.name ? 1 : -1))
        break
      case 'status':
        data.sort((a: Monitor, b: Monitor) => (a.status > b.status ? 1 : -1))
        break
      case 'uptime':
        data.sort((a: Monitor, b: Monitor) =>
          a.uptime && b.uptime && a.uptime > b.uptime ? 1 : -1
        )
        break
      case 'day50':
        data.sort((a: Monitor, b: Monitor) => (a.day50 && b.day50 && a.day50 > b.day50 ? 1 : -1))
        break
      case 'dayAvg':
        data.sort((a: Monitor, b: Monitor) =>
          a.dayAvg && b.dayAvg && a.dayAvg > b.dayAvg ? 1 : -1
        )
        break
      default:
    }
    if (sortOption === field) {
      const dir = sortDir === 'asc' ? 'desc' : 'asc'
      setSortedMonitors(dir === 'asc' ? data : data.reverse())
      setSortDir(dir)
    } else {
      setSortDir('asc')
      setSortedMonitors(data)
    }
    setSortOption(field)
  }

  const onModalClose = () => {
    setIsModalOpen(false)
    setSelectedMonitor(undefined)
  }

  const openDeleteModal = (mon: string) => {
    setIsModalOpen(true)
    setSelectedMonitor(mon)
  }

  const deleteMonitor = async () => {
    await axios({
      method: 'DELETE',
      url: `/monitors/${selectedMonitor}`,
    })
    Store.queryClient?.invalidateQueries(['monitors-list'])
    Store.queryClient?.invalidateQueries(['monitors-stats'])
    onModalClose()
  }

  return (
    <Flex direction='column'>
      <Section>
        <Flex alignItems='center' justify={'space-between'}>
          <Text variant='header' color='black'>
            All monitors
          </Text>
          <PrimaryButton
            label='New monitor'
            variant='emphasis'
            color={'white'}
            onClick={() => navigate('/console/monitors/newapi')}
          ></PrimaryButton>
        </Flex>
      </Section>
      <Section py={4}>
        <Flex mb='6' gap={2} alignItems={'center'} justify='end'>
          <Text variant='paragraph' color='darkgray.100'>
            View
          </Text>
          <Button
            bg='transparent'
            border='1px solid'
            borderColor='gray.200'
            borderRadius={8}
            p={1}
            onClick={() => {
              Store.UIState.monitors.isGridView = true
              setIsGridView(true)
            }}
          >
            <Icon
              color={isGridView ? 'darkblue.100' : 'darkgray.100'}
              fontSize={'lg'}
              as={FiGrid}
              cursor='pointer'
            />
          </Button>
          <Button
            bg='transparent'
            border='1px solid'
            borderColor='gray.200'
            borderRadius={8}
            p={1}
            onClick={() => {
              Store.UIState.monitors.isGridView = false
              setIsGridView(false)
            }}
          >
            <Icon
              color={!isGridView ? 'darkblue.100' : 'darkgray.100'}
              fontSize={'lg'}
              as={FiList}
              cursor='pointer'
            />
          </Button>
          <Select
            borderRadius={8}
            width='140px'
            color='gray.300'
            borderColor='gray.200'
            {...register(`filter`)}
          >
            <option value=''>All</option>
            <option value='up'>Up</option>
            <option value='down'>Down</option>
          </Select>
          <Select
            borderRadius={8}
            width='140px'
            color='gray.300'
            borderColor='gray.200'
            {...register(`sortBy`)}
          >
            <option value='latest'>Latest</option>
            <option value='oldest'>Oldest</option>
          </Select>
        </Flex>
        <Flex gap={{ sm: 2, lg: 4 }}>
          <StatBox status='up' stats={stats} />
          <StatBox status='down' stats={stats} />
          <StatBox status='paused' stats={stats} />
        </Flex>
      </Section>
      <Section p={0} mb='0' display='flex' minH='calc(100vh - 300px)' flexDirection='column'>
        {isGridView ? (
          <Box p={4} pb={8} flex='1'>
            <Grid gap='6' templateColumns={{ sm: '1fr', xl: '1fr 1fr' }}>
              {stats &&
                sortedMonitors.map((monitor) => (
                  <MonitorStatusCard
                    mon={monitor}
                    stats={stats.find((stat) => monitor.id === stat.monitorId)}
                    key={monitor.id}
                  />
                ))}
            </Grid>
          </Box>
        ) : (
          <Box p={4} pb={8} flex='1'>
            <TableContainer>
              <Table>
                <Thead>
                  <Tr bg='rgba(22, 216, 181, 0.1)'>
                    <Th px={4} py={3}>
                      <Flex alignItems='center' gap={1} onClick={() => sortBy('name')}>
                        <Text variant='emphasis' color='black'>
                          Name
                        </Text>
                        <SortIcons />
                      </Flex>
                    </Th>
                    <Th px={4} py={3}>
                      <Flex alignItems='center' gap={1} onClick={() => sortBy('status')}>
                        <Text variant='emphasis' color='black'>
                          Status
                        </Text>
                        <SortIcons />
                      </Flex>
                    </Th>
                    <Th px={4} py={3}>
                      <Text variant='emphasis' color='black'>
                        Data
                      </Text>
                    </Th>
                    <Th px={4} py={3}>
                      <Flex alignItems='center' gap={1} onClick={() => sortBy('uptime')}>
                        <Text variant='emphasis' color='black'>
                          Uptime
                        </Text>
                        <SortIcons />
                      </Flex>
                    </Th>
                    <Th px={4} py={3}>
                      <Flex alignItems='center' gap={1} onClick={() => sortBy('dayAvg')}>
                        <Text variant='emphasis' color='black'>
                          2HR AVG
                        </Text>
                        <SortIcons />
                      </Flex>
                    </Th>
                    <Th px={4} py={3}>
                      <Flex alignItems='center' gap={1} onClick={() => sortBy('day50')}>
                        <Text variant='emphasis' color='black'>
                          24HR MEDIAN
                        </Text>
                        <SortIcons />
                      </Flex>
                    </Th>
                    <Th px={4} py={3}>
                      <Text variant='emphasis' color='black'>
                        24HR P95
                      </Text>
                    </Th>
                    <Th px={4} py={3} textAlign='center'>
                      <Text variant='emphasis' color='black'>
                        ACTIONS
                      </Text>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {stats &&
                    sortedMonitors.map((monitor) => (
                      <MonitorListItem
                        mon={monitor}
                        stats={stats.find((stat) => monitor.id === stat.monitorId)}
                        key={monitor.id}
                        onDelete={openDeleteModal}
                      />
                    ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        )}
        {/* Footer */}
        <Flex
          alignItems='center'
          px={4}
          py={1}
          justifyContent='space-between'
          boxShadow='0px -4px 8px rgba(0, 0, 0, 0.05)'
        >
          <Text flex={1} variant='text-field' color='darkgray.100'>
            Show {totalCount > pageSize ? pageSize : totalCount} monitors of {totalCount}
          </Text>
          <Box maxW={96}>
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
          <Flex alignItems={'center'} flex={1} justifyContent='flex-end'>
            <Text mr={2} variant='details' color='darkgray.100'>
              Monitors per page
            </Text>
            <Select
              w={16}
              fontWeight='600'
              borderRadius='8'
              borderColor='darkgray.100'
              size='xs'
              defaultValue={pageSize}
              onChange={handlePageSizeChange}
            >
              <option value={10}>10</option>
              <option value={16}>16</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </Select>
          </Flex>
        </Flex>
      </Section>
      {/* Delete Monitor Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius={16} boxShadow='0px 4px 16px rgba(38, 50, 56, 0.1)'>
          <ModalHeader pb={2}>
            <Text color='black' variant='header'>
              Delete Monitor
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text variant='text-field' color='gray.300'>
              Are you really sure to delete this monitor?
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
              onClick={deleteMonitor}
            ></PrimaryButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  )
}

export default MainPage
function arr(arr: any) {
  throw new Error('Function not implemented.')
}
