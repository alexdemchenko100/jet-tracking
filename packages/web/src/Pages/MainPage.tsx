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
} from '@chakra-ui/react'
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom'
import { FiEdit, FiTrendingUp, FiTrendingDown, FiPause, FiGrid, FiList } from 'react-icons/fi'
import { CgChevronLeft, CgChevronRight } from 'react-icons/cg'
import {
  Pagination,
  PaginationPrevious,
  PaginationNext,
  PaginationPageGroup,
  PaginationContainer,
  PaginationPage,
  usePagination,
} from "@ajna/pagination";
import {
  Text,
  Section,
  PrimaryButton,
  StatusUpOrDown,
  NewMonitorHero,
} from '../components'

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

const uptime24 = (m: MonitorStats) => {
  if (m.day?.numItems > 0) {
    return Math.round(((m.day.numItems - m.day.numErrors) / m.day.numItems) * 100 * 100) / 100
  } else {
    return 0
  }
}

function RunChart({ stats }: { stats?: MonitorStats }) {
  const navigate = useNavigate()
  if (!stats || !stats.lastResults) {
    return <></>
  }

  const p50 = stats.day.p50
  const p95 = stats.day.p95

  return (
    <Flex gap='2' alignItems='baseline' maxW={'430px'} height='auto'>
      {stats.lastResults.map((r) => (
        <Tooltip borderRadius='4' bg='darkgray.100' py={0.5} px={1.5} fontSize='sm' fontWeight='600' label={'Time - ' + r.totalTime + 'ms'} key={r.id}>
          <Box
            key={r.id}
            w='1.5'
            h={r.totalTime > p50 ? (r.totalTime > p95 ? '7' : '6') : '5'}
            bgColor={r.err ? 'red.200' : 'green.200'}
            borderRadius='4'
            _hover={{
              w: '2',
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
        <Flex alignItems='center' cursor='pointer' onClick={() => navigate(`/console/monitors/${mon?.id}`)}>
          <Text variant='header' color='black' _hover={{ color: 'darkblue.100' }} transition='color 0.2s ease'>{mon?.name}</Text>
          <StatusUpOrDown stats={stats} />
        </Flex>
        <Button borderRadius='4' bg='lightgray.100' p='0' onClick={() => navigate(`/console/monitors/${mon?.id}/edit`)}>
          <Icon color='gray.300' as={FiEdit} cursor='pointer' />
        </Button>
      </Flex>
      <Text variant='text-field' color='gray.300' textOverflow='ellipsis' overflow='hidden' whiteSpace='nowrap'>{mon?.url}</Text>
      <Box mt={4} w={8} h={1} bg='gray.200' borderRadius='2'></Box>
      <Box my={5}>
        <RunChart stats={stats} />
      </Box>
      <Flex>
        <Flex flexDirection={'column'} mr={10}>
          <Text variant='emphasis' color='black' mb={2}>UPTIME</Text>
          <Text variant='emphasis' color='gray.300'>{stats ? uptime24(stats) + '%' : ''}</Text>
        </Flex>

        <Flex flexDirection={'column'} mr={10}>
          <Text variant='emphasis' color='black' mb={2}>24Hr AVG</Text>
          <Text variant='emphasis' color='gray.300'>{stats?.day.avg.toFixed(2)}</Text>
        </Flex>

        <Flex flexDirection={'column'} mr={10}>
          <Text variant='emphasis' color='black' mb={2}>24Hr MEDIAN</Text>
          <Text variant='emphasis' color='gray.300'>{stats?.day.p50.toFixed(2)}</Text>
        </Flex>

        <Flex flexDirection={'column'}>
          <Text variant='emphasis' color='black' mb={2}>24 Hr P95</Text>
          <Text variant='emphasis' color='gray.300'>{stats?.day.p95.toFixed(2)}</Text>
        </Flex>
      </Flex>
    </Flex>
  )
}

interface StatBoxProps {
  status: string
  value: number
}

const StatBox = ({ status, value }: StatBoxProps) => {
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
      <Flex width={10} mr={{ sm: 2, lg: 4 }} height={10} alignItems='center' justifyContent='center' borderRadius={8} bg={bgColor}>
        {status === 'up' && <Icon color='white' as={FiTrendingUp} />}
        {status === 'down' && <Icon color='white' as={FiTrendingDown} />}
        {status === 'paused' && <Icon color='white' fill='white' as={FiPause} />}
      </Flex>
      <Flex direction={'column'}>
        <Text variant='text-field' color='gray.300' mb={1}>Total {status}</Text>
        <Text variant='emphasis' color='black'>{value}</Text>
      </Flex>
    </Flex>
  )
}

export function MainPage() {
  const navigate = useNavigate()
  const [filterOption, setFilterOption] = useState<string|undefined>(undefined);
  const { register, watch } = useForm<IFormInputs>();
  const [isGridView, setIsGridView] = useState<boolean>(true)
  const [statsSummary, setStatsSummary] = useState<StatsSummary>({})
  const {
    pages,
    pagesCount,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
  } = usePagination({
    total: 40,
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

  async function getMonitors() {
    let resp = await axios({
      method: 'GET',
      url: '/monitors',
    })

    if (resp.status == 200) {
      const results = resp.data as Monitor[]
      return results
    }
    throw Error('Failed to get odemand results')
  }

  const { isLoading, data: monitors } = useQuery<Monitor[], Error>(
    ['monitors-list'],
    () => getMonitors(),
    {}
  )

  async function getMonitorStats() {
    let resp = await axios({
      method: 'GET',
      url: '/monitors/stats',
    })

    if (resp.status == 200) {
      const results = resp.data as MonitorStats[]
      let downMonitors = 0, upMonitors = 0, pausedMonitors = 0
      results.forEach(item => {
        if (item.status === 'paused') {
          pausedMonitors++
        } else if (Boolean(item.lastResults[0].err)) {
          downMonitors++
        } else {
          upMonitors++
        }
      })
      setStatsSummary({ up: upMonitors, down: downMonitors, paused: pausedMonitors })
      return results
    }
    throw Error('Failed to get odemand results')
  }

  const { data: stats } = useQuery<MonitorStats[], Error>(['monitors-stats'], () =>
    getMonitorStats()
  )

  const uptime24 = (m: MonitorStats) => {
    if (m.day?.numItems > 0) {
      return ((m.day.numItems - m.day.numErrors) / m.day.numItems) * 100
    } else {
      return 0
    }
  }

  if (monitors && monitors.length == 0) {
    return <NewMonitorHero />
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(parseInt(event.target.value));
  };

  return (
    <Flex direction='column'>
      <Section>
        <Flex alignItems='center' justify={'space-between'}>
          <Text variant='header' color='black'>All monitors</Text>
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
          <Text variant='paragraph' color='darkgray.100'>View</Text>
          <Button
            bg='transparent'
            border='1px solid'
            borderColor='gray.200'
            borderRadius={8}
            p={1}
            onClick={() => setIsGridView(true)}
          >
            <Icon color={isGridView ? 'darkblue.100' : 'darkgray.100'} fontSize={'lg'} as={FiGrid} cursor='pointer' />
          </Button>
          <Button
            bg='transparent'
            border='1px solid'
            borderColor='gray.200'
            borderRadius={8}
            p={1}
            onClick={() => setIsGridView(false)}
          >
            <Icon color={!isGridView ? 'darkblue.100' : 'darkgray.100'} fontSize={'lg'} as={FiList} cursor='pointer' />
          </Button>
          <Select borderRadius={8} width='140px' color='gray.300' borderColor='gray.200' {...register(`filter`)}>
            <option value=''>All</option>
            <option value='up'>Up</option>
            <option value='down'>Down</option>
          </Select>
          <Select borderRadius={8} width='140px' color='gray.300' borderColor='gray.200' {...register(`sortBy`)}>
            <option value='latest'>Latest</option>
            <option value='oldest'>Oldest</option>
          </Select>
        </Flex>
        <Flex gap={{ sm: 2, lg: 4 }}>
          <StatBox status='up' value={statsSummary.up || 0} />
          <StatBox status='down' value={statsSummary.down || 0} />
          <StatBox status='paused' value={statsSummary.paused || 0} />
        </Flex>
      </Section>
      <Section p={0} mb='0' display='flex' minH='calc(100vh - 300px)' flexDirection='column'>
        {/* Grid View */}
        <Box p={4} pb={8} flex='1'>
          <Grid gap='6' templateColumns={{ sm: '1fr', xl: '1fr 1fr' }}>
            {monitors && stats?.map((stats) => (
              <MonitorStatusCard
                mon={monitors.find((m) => m.id === stats.monitorId)}
                stats={stats}
                key={stats.monitorId}
              />
            ))}
          </Grid>
        </Box>
        {/* Footer */}
        <Flex alignItems='center' px={4} py={1} justifyContent='space-between' boxShadow='0px -4px 8px rgba(0, 0, 0, 0.05)'>
          <Text flex={1} variant='text-field' color='darkgray.100'>Show 16 monitors of 40</Text>
          <Box maxW={96}>
            <Pagination
              currentPage={currentPage}
              pagesCount={pagesCount}
              onPageChange={handlePageChange}
            >
              <PaginationContainer
                align="center"
                justify="space-between"
                gap={2}
                w="full"
              >
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
                <PaginationPageGroup
                  isInline
                  align="center"
                >
                  {pages.map((page: number) => (
                    <PaginationPage
                      key={`pagination_page_${page}`}
                      _current={{
                        color: "darkblue.100",
                      }}
                      color="darkgray.100"
                      bg='transparent'
                      fontSize="sm"
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
                  <Icon as={CgChevronRight}  color='darkblue.100'></Icon>
                </PaginationNext>
              </PaginationContainer>
            </Pagination>
          </Box>
          <Flex alignItems={'center'} flex={1} justifyContent='flex-end'>
            <Text mr={2} variant='details' color='darkgray.100'>Monitors per page</Text>
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
    </Flex>
  )
}

export default MainPage
