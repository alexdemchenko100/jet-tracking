import { Monitor, MonitorStats } from '@httpmon/db'
import axios from 'axios'
import { useQuery } from 'react-query'
import { useEffect } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Tooltip,
} from '@chakra-ui/react'

import { useNavigate } from 'react-router-dom'
import { NewMonitorHero } from '../components/NewMonitorHero'
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi'

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
  const navigate = useNavigate()
  if (!stats || !stats.lastResults) {
    return <></>
  }

  const p50 = stats.day.p50
  const p95 = stats.day.p95

  return (
    <Flex gap='1' alignItems='baseline'>
      {stats.lastResults.map((r) => (
        <Tooltip label={'Time - ' + r.totalTime + 'ms'} key={r.id}>
          <Box
            key={r.id}
            w='1.5'
            h={r.totalTime > p50 ? (r.totalTime > p95 ? '6' : '5') : '4'}
            bgColor={r.err ? 'red' : 'green'}
            borderRadius='2'
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

function StatusDot({
  label,
  color,
  size = '20px',
}: {
  label: string
  color: string
  size?: string
}) {
  return (
    <Flex gap='2' alignItems='center'>
      <Box w={size} h={size} borderRadius='50%' bgColor={color}></Box>
      <Heading size='md' color={color}>
        {label}
      </Heading>
    </Flex>
  )
}

function StatusUpOrDown({ stats }: { stats?: MonitorStats }) {
  let bErr: boolean
  let color: string
  let label: string

  if (!stats || !stats.lastResults || stats.lastResults.length < 1) {
    label = ''
    color = 'gray.500'
  } else {
    bErr = Boolean(stats.lastResults[0].err)
    color = bErr ? 'red' : 'green'
    label = bErr ? 'DOWN' : 'UP'
  }
  return <StatusDot label={label} color={color} />
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
      <Flex gap='2'>
        <StatusUpOrDown stats={stats} />
        <Heading size='md' ml='2'>
          {mon.name}
        </Heading>
      </Flex>

      <RunChart stats={stats} />

      <StatGroup bgColor='blue.100'>
        <Stat>
          <StatLabel>UPTIME</StatLabel>
          <StatNumber>{stats ? uptime24(stats) + '%' : ''}</StatNumber>
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

function StatusHeader({ stats }: { stats: MonitorStats[] }) {
  //find number of stats where err is false
  const nAll = stats.length
  const nUP = stats.filter((s) => !s.lastResults?.[0]?.err).length
  const nDown = nAll - nUP

  if (nAll === 0) {
    return <></>
  }

  return nAll == nUP ? (
    <Flex gap='2'>
      <Icon as={FiCheckCircle} color='green' w='6' h='6' />
      <Heading color='green' size='md'>
        {'UP - All Monitors'}
      </Heading>
    </Flex>
  ) : (
    <Flex gap='4' direction='column'>
      <Flex gap='2'>
        <Icon as={FiCheckCircle} color='green' w='6' h='6' />
        <Heading color='green' size='md'>
          {'UP - ' + nUP + ' Monitors'}
        </Heading>
      </Flex>

      <Flex gap='2'>
        <Icon as={FiAlertCircle} color='red' w='6' h='6' />
        <Heading color='red' size='md'>
          {'DOWN - ' + nDown + ' Monitors'}
        </Heading>
      </Flex>
    </Flex>
  )
}

export function MainPage() {
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

  return (
    <Flex direction='column' ml='4'>
      <Flex justify='space-between'>
        <Button
          size='md'
          mr='2'
          mb='2'
          ml='auto'
          colorScheme='blue'
          onClick={() => navigate('/console/monitors/newapi')}
        >
          New Monitor
        </Button>
      </Flex>

      <Flex gap='4' direction='column'>
        {stats && stats.length > 0 && <StatusHeader stats={stats} />}

        <Box mb='4' />

        <Flex gap='4' wrap='wrap'>
          {monitors?.map((mon) => (
            <MonitorStatusCard
              mon={mon}
              stats={stats?.find((s) => s.monitorId == mon.id)}
              key={mon.id}
            />
          ))}
        </Flex>
      </Flex>
    </Flex>
  )
}

export default MainPage
