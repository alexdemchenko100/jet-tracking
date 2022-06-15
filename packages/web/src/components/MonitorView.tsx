import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stat,
  useDisclosure,
  useMediaQuery,
} from '@chakra-ui/react'
import { Monitor, MonitorPeriodStats, MonitorStats, MonitorTable } from '@httpmon/db'
import axios from 'axios'
import { useMutation, useQuery } from 'react-query'
import { useNavigate, useParams, Link } from 'react-router-dom'
import MonitorResultTable from './MonitorResultTable'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MonitorTimeChart } from './MonitorTimeChart'
import SplitPane from './SplitPane'
import { APIResultById } from './APIResultById'
import { APIResultByDemand } from './APIResultByDemand'
import { formatFrequency } from '../services/FrequencyScale'
import { getMonitorLocationName } from '../services/MonitorLocations'
import { FiMapPin, FiChevronRight, FiEdit, FiMoreHorizontal, FiGlobe, FiClock } from 'react-icons/fi'
import { Store } from '../services/Store'
import Text from './Text'
import Section from './Section'
import PrimaryButton from './PrimaryButton'

interface DeleteProps {
  id: string
}
function DoubleCheckDelete({ id }: DeleteProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef(null)
  const navigate = useNavigate()

  const {
    mutateAsync: deleteMonitor,
    isLoading: isDeleteing,
    error: deleteError,
  } = useMutation<number, Error>(async () => {
    const resp = await axios({
      method: 'DELETE',
      url: `/monitors/${id}`,
    })

    Store.queryClient?.invalidateQueries(['monitors-list'])
    return resp.data
  })

  async function onDelete() {
    onClose()
    deleteMonitor()
    navigate('/console/monitors')
  }

  return (
    <>
      <MenuItem onClick={onOpen}>Delete</MenuItem>
      <AlertDialog
        motionPreset='slideInBottom'
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent borderRadius={16} boxShadow='0px 4px 16px rgba(38, 50, 56, 0.1)'>
          <AlertDialogHeader><Text color='black' variant="header">Delete this monitor?</Text></AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            <Text variant='paragraph' color='gray.300'>All related information will be lost, this action is permanent, and cannot be undone.</Text>
          </AlertDialogBody>
          <AlertDialogFooter pb={6}>
            <Button
              variant="outline"
              borderRadius={24}
              border='2px'
              px='22px'
              color='darkblue.100'
              borderColor='darkblue.100'
              _hover={{ bg: 'transparent' }}
              mr={3}
              onClick={onDelete}
            >
              <Text color='darkblue.100' variant="emphasis">Delete</Text>
            </Button>
            <PrimaryButton
              label='Cancel'
              variant='emphasis'
              color='white'
              onClick={onClose}
            >
            </PrimaryButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface MonitorStatsProps {
  stats: MonitorPeriodStats
  title: string
}

interface MonitorInfoProps {
  id: string,
  runNow: () => void,
  mon?: MonitorTable | null,
}

function round(v: number) {
  return v.toFixed(v % 1 && 1)
}

function uptime(stats: MonitorPeriodStats) {
  if (stats.numItems > 0) {
    const numSucess = stats.numItems - stats.numErrors
    const uptime = numSucess / stats.numItems

    //return uptime as a percentage
    return round(uptime * 100) + '%'
  }
  return '0%'
}

function MonitorStatsView({ stats, title }: MonitorStatsProps) {
  return (
    <Box py='7' m={3} flex={1} px='6' border='1px' borderColor='gray.200' borderStyle='solid' borderRadius={8}>
      <Flex>
        <Text variant='title' color='black' showUnderline>{title}</Text>
      </Flex>
      <Flex alignItems='start' justifyContent='space-around' mt={10}>
        <Stat>
          <Text variant='emphasis' color='black'>Total</Text><br/>
          <Text variant='emphasis' color='gray.300'>{stats.numItems}</Text>
        </Stat>
        <Stat>
          <Text variant='emphasis' color='black'>Errors</Text><br/>
          <Text variant='emphasis' color='gray.300'>{stats.numErrors}</Text>
        </Stat>
        <Stat>
          <Text variant='emphasis' color='black'>Uptime</Text><br/>
          <Text variant='emphasis' color='gray.300'>{uptime(stats)}</Text>
        </Stat>
        <Stat>
          <Text variant='emphasis' color='black'>Avg</Text><br/>
          <Text variant='emphasis' color='gray.300'>{round(stats.avg)}ms</Text>
        </Stat>
        <Stat>
          <Text variant='emphasis' color='black'>Median</Text><br/>
          <Text variant='emphasis' color='gray.300'>{round(stats.p50)}ms</Text>
        </Stat>
        <Stat>
          <Text variant='emphasis' color='black'>P95</Text><br/>
          <Text variant='emphasis' color='gray.300'>{round(stats.p95)}ms</Text>
        </Stat>
      </Flex>
    </Box>
  )
}

function MonitorInfo(props: MonitorInfoProps) {
  const navigate = useNavigate()
  const { id, mon, runNow } = props

  const freqFormat = useMemo(() => formatFrequency(mon?.frequency ?? 0), [mon])
  const locations = mon && mon.locations ? mon.locations : []

  return (
    <Section py={4}>
      <Flex mb={2} alignItems='center'>
        <Flex as={Link} alignItems='center' to="/console/monitors">
          <Text variant='details' color='darkblue.100'>Monitors</Text>
          <Icon name='location' fontSize={'sm'} mx='1' as={FiChevronRight} />
        </Flex>
        <Text variant='details' color='gray.300'>Details</Text>
      </Flex>
      <Flex alignItems='center' justify={'space-between'}>
        <Text variant='header' color='black' showUnderline>{mon?.name}</Text>
        <Flex gap='4' alignItems={'center'}>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label='Options'
              width={6}
              minW={6}
              h={6}
              bg='lightgray.100'
              icon={<FiMoreHorizontal />}
            />
            <MenuList color='gray.800' zIndex='3'>
              <DoubleCheckDelete id={id} />
            </MenuList>
          </Menu>
          <PrimaryButton
            label='Run Now'
            variant='emphasis'
            color={'white'}
            onClick={runNow}
          ></PrimaryButton>
          <Button borderRadius='4' bg='lightgray.100' p='0' onClick={() => navigate(`/console/monitors/${id}/edit`)}>
            <Icon color='gray.300' as={FiEdit} cursor='pointer' />
          </Button>
        </Flex>
      </Flex>
      <Flex alignItems={'center'} wrap='wrap' gap={2} mt={5}>
        <Flex alignItems={'center'} maxW='100%' overflow='hidden'>
          <Icon fontSize='md' color='black' as={FiGlobe} cursor='pointer' mr='1' />
          <Text variant='title' color='black' textOverflow='ellipsis' whiteSpace='nowrap' overflow='hidden'>{mon?.url}</Text>
        </Flex>
        <Flex alignItems={'center'} py={1} px={4} bg='lightgray.100' borderRadius={16}>
          <Icon fontSize='sm' color='darkgray.100' mr='1' as={FiClock} cursor='pointer' />
          <Text variant='details' color='darkgray.100'>{freqFormat}</Text>
        </Flex>
        <Box w='1px' h='5' bg='gray.300' mx={2}></Box>
        {locations.length > 0 && (
          <Flex alignItems='center'>
            <Icon name='location' mr='2' color='black' as={FiMapPin} />
            {locations.map((loc, index) => (
              <Text variant='title' color='black' mr={2} key={index}>
                {getMonitorLocationName(loc)}
                {(index !== locations.length - 1) ? ',' : ''}
              </Text>
            ))}
          </Flex>
        )}
      </Flex>
    </Section>
  )
}

export function MonitorView() {
  const navigate = useNavigate()
  const { id } = useParams()

  if (!id) {
    return <p>Missing id: Need to show stats</p>
  }

  const [monitorResultId, setMonitorResultId] = useState<string>()
  const [monitorOnDemandId, setMonitorOnDemandId] = useState<string>()
  const [refreshOnDemand, setRefreshOnDemand] = useState(0)

  function onShowMonitorResult(id: string) {
    setMonitorOnDemandId(undefined)
    setMonitorResultId(id)
  }

  const [vertical] = useMediaQuery('(max-width: 1278px)')

  const {
    isLoading,
    data: mon,
    error,
  } = useQuery<Monitor | null>(id, async () => {
    try {
      const resp = await axios({ method: 'GET', url: `/monitors/${id}` })
      if (resp) return resp.data as Monitor
    } catch (error: any) {
      if (error.response?.status === 404) {
        //if the monitor is not found, redirect to the list
        navigate('/console/monitors')
      }
      throw error
    }
    return null
  })

  const { data: stats, error: statError } = useQuery<MonitorStats>(['stats', id], async () => {
    const resp = await axios({
      method: 'GET',
      url: `/monitors/${id}/stats`,
    })
    return resp.data as MonitorStats
  })

  useEffect(() => {
    document.title = 'Monitor View | ProAutoma'
  }, [])

  const runNow = () => {
    setMonitorOnDemandId(mon?.id ?? '')
    setRefreshOnDemand(refreshOnDemand + 1)
    setMonitorResultId(undefined)
  }

  return (
    <>
      {!vertical && <MonitorInfo id={id} runNow={runNow} mon={mon} />}
      <SplitPane orientation={vertical ? 'vertical' : 'horizontal'}>
        <Box overflow='auto'>
          {vertical && <MonitorInfo id={id} runNow={runNow} mon={mon} />}
          <Section py={4}>
            <Text variant='title' color='black'>Analytics</Text>
            {mon && (
              <>
                <Flex mt={4} mx={-3} flexWrap='wrap'>
                  {stats && stats.week && <MonitorStatsView stats={stats.week} title='Last 7 Days' />}
                  {stats && stats.day && <MonitorStatsView stats={stats.day} title='Last 24 Hours' />}
                </Flex>
                <MonitorTimeChart id={id} width='100%' height='200px'/>
              </>
            )}
          </Section>
          <Section py={4} mb={0}>
            <MonitorResultTable onShowMonitorResult={onShowMonitorResult} />
          </Section>
        </Box>
        {monitorResultId ? (
          <APIResultById id={monitorResultId} onClose={() => setMonitorResultId(undefined)} />
        ) : (
          monitorOnDemandId &&
          mon && (
            <APIResultByDemand
              onDemandMonitor={mon}
              refresh={refreshOnDemand}
              onClose={() => setMonitorOnDemandId(undefined)}
            />
          )
        )}
      </SplitPane>
    </>
  )
}
