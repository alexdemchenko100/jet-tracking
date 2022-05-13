import { Monitor, MonitorStats } from '@httpmon/db'
import axios from 'axios'
import { useQuery } from 'react-query'

import { useEffect, useMemo } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  VStack,
  Tag,
  Icon,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react'

import { useNavigate } from 'react-router-dom'
import { NewMonitorHero } from '../components/NewMonitorHero'

import { FiCheckCircle } from 'react-icons/fi'

type MonitorAndStats = Monitor & MonitorStats

interface StatusProps {
  mon: Monitor
  stats?: MonitorStats
}

const uptime24 = (m: MonitorStats) => {
  if (m.day?.numItems > 0) {
    return Math.round(((m.day.numItems - m.day.numErrors) / m.day.numItems) * 100 * 100) / 100
  } else {
    return 0
  }
}

function RunChart({ stats }: { stats?: MonitorStats }) {
  if (!stats || !stats.lastResults) {
    return <></>
  }

  return (
    <Flex gap='1'>
      {stats.lastResults.map((r) => (
        <Box key={r.id}>
          <Box w='1' h='4' bgColor={r.err ? 'red' : 'green'}></Box>
        </Box>
      ))}
    </Flex>
  )
}

function MonitorStatusCard({ mon, stats }: StatusProps) {
  const navigate = useNavigate()

  return (
    <Flex
      flexDirection='column'
      gap='4'
      borderRadius='xl'
      bgColor='blue.100'
      p='2'
      w='40em'
      justifyContent='begin'
      cursor='pointer'
      onClick={() => navigate(`/console/monitors/${mon.id}`)}
    >
      <Flex gap='4'>
        <Tag color='green' fontSize='md' fontWeight='extrabold' bgColor='blue.200'>
          <Icon mr='2' as={FiCheckCircle} />
          UP
        </Tag>
        <Heading size='md'>{mon.name}</Heading>

        {/* <HStack spacing='4' ml='auto'>
          <Tag color='green' fontSize='md' fontWeight='extrabold' bgColor='blue.200'>
            Uptime
          </Tag>
          <Heading size='md'>{stats ? uptime24(stats) + 'ms' : ''}</Heading>
        </HStack> */}
      </Flex>

      <RunChart stats={stats} />

      <StatGroup bgColor='blue.100'>
        <Stat>
          <StatLabel>UPTIME</StatLabel>
          <StatNumber>{stats ? uptime24(stats) + 'ms' : ''}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel>24Hr AVG</StatLabel>
          <StatNumber>{stats?.day.avg.toFixed(2)}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel>24Hr MEDIAN</StatLabel>
          <StatNumber>{stats?.day.p50.toFixed(2)}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel>24 Hr P95</StatLabel>
          <StatNumber>{stats?.day.p95.toFixed(2)}</StatNumber>
        </Stat>
      </StatGroup>
    </Flex>
  )
}

export function Dashboard() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Dashboard | ProAutoma'
  }, [])

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
      return results
    }
    throw Error('Failed to get odemand results')
  }

  const { data: stats } = useQuery<MonitorStats[], Error>(['monitors-stats'], () =>
    getMonitorStats()
  )

  const uptime24 = (m: MonitorAndStats) => {
    if (m.day?.numItems > 0) {
      return Math.round(((m.day.numItems - m.day.numErrors) / m.day.numItems) * 100 * 100) / 100
    } else {
      return 0
    }
  }

  if (monitors && monitors.length == 0) {
    return <NewMonitorHero />
  }

  return (
    <>
      <Flex justify='space-between'>
        <Heading size='md' mb='8'>
          Monitors
        </Heading>

        <Button
          size='sm'
          mr='2'
          mb='2'
          colorScheme='gray.200'
          onClick={() => navigate('/console/monitors/newapi')}
        >
          New Monitor
        </Button>
      </Flex>

      <Flex gap='4' direction='column'>
        {monitors?.map((mon) => (
          <MonitorStatusCard
            mon={mon}
            stats={stats?.find((s) => s.monitorId == mon.id)}
            key={mon.id}
          />
        ))}
      </Flex>
    </>
  )
}

export default Dashboard
