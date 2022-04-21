import { ChevronDownIcon } from '@chakra-ui/icons'
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
  Divider,
  Flex,
  Grid,
  Heading,
  Icon,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuItemOption,
  MenuList,
  Stat,
  StatLabel,
  StatNumber,
  Tag,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react'
import { Monitor, MonitorPeriodStats, MonitorStats } from '@httpmon/db'
import axios from 'axios'
import { useMutation, useQuery } from 'react-query'
import { useNavigate, useParams } from 'react-router-dom'
import MonitorResultTable from './MonitorResultTable'
import { useMemo, useRef, useState } from 'react'
import { MonitorTimeChart } from './MonitorTimeChart'
import SplitPane from './SplitPane'
import { APIResultById } from './APIResultById'
import { APIResultByDemand } from './APIResultByDemand'
import { formatFrequency } from '../services/FrequencyScale'
import { getMonitorLocationName } from '../services/MonitorLocations'
import { FiMapPin } from 'react-icons/fi'

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
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>Deleting monitor</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure you want to delete this monitor? All corresponding monitor results will be
            deleted permanently.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              No
            </Button>
            <Button colorScheme='red' onClick={onDelete} ml={3}>
              Yes
            </Button>
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
    <Box p='1' border='1px' borderColor='blue' borderStyle='solid'>
      <Heading size='md'>{title}</Heading>
      <Flex alignItems='start' justifyContent='space-around'>
        <Stat>
          <StatLabel>Total</StatLabel>
          <StatNumber>{stats.numItems}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Errors</StatLabel>
          <StatNumber>{stats.numErrors}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Uptime</StatLabel>
          <StatNumber>{uptime(stats)}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Avg</StatLabel>
          <StatNumber>{round(stats.avg)}ms</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Median</StatLabel>
          <StatNumber>{round(stats.p50)}ms</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>P95</StatLabel>
          <StatNumber>{round(stats.p95)}ms</StatNumber>
        </Stat>
      </Flex>
    </Box>
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

  const vertical = useBreakpointValue({ base: true, lg: false })

  const {
    isLoading,
    data: mon,
    error,
  } = useQuery<Monitor>(id, async () => {
    const resp = await axios({
      method: 'GET',
      url: `/monitors/${id}`,
    })
    return resp.data
  })

  const { data: stats, error: statError } = useQuery<MonitorStats>(['stats', id], async () => {
    const resp = await axios({
      method: 'GET',
      url: `/monitors/${id}/stats`,
    })
    return resp.data as MonitorStats
  })

  const freqFormat = useMemo(() => formatFrequency(mon?.frequency ?? 0), [mon])

  return (
    <SplitPane orientation={vertical ? 'vertical' : 'horizontal'}>
      <Grid gap='1em'>
        <Flex justifyContent='end'>
          <Button
            alignSelf='center'
            variant='solid'
            mx='1em'
            size='sm'
            colorScheme='green'
            onClick={() => {
              setMonitorOnDemandId(mon?.id ?? '')
              setRefreshOnDemand(refreshOnDemand + 1)
              setMonitorResultId(undefined)
            }}
          >
            Run now
          </Button>

          <Menu>
            <MenuButton
              alignSelf='center'
              rightIcon={<ChevronDownIcon />}
              variant='outline'
              mx='1em'
              size='sm'
              as={Button}
              colorScheme='blue'
            >
              Actions
            </MenuButton>
            <MenuList color='gray.800' zIndex='3'>
              <MenuItem onClick={() => navigate(`/console/monitors/${id}/edit`)}>Edit</MenuItem>
              <DoubleCheckDelete id={id} />
            </MenuList>
          </Menu>
        </Flex>

        {mon && (
          <>
            <Heading size='lg'>{mon.name}</Heading>
            <Flex alignItems='center'>
              <Tag size='md' colorScheme='blue'>
                {mon.method}
              </Tag>
              <Heading size='md' ml='4'>
                {mon.url}
              </Heading>
              <Tag size='lg' ml='4' colorScheme='green'>
                {freqFormat}
              </Tag>
            </Flex>
            {mon.locations && mon.locations.length > 0 && (
              <Flex alignItems='center'>
                <Icon name='location' mr='1em' as={FiMapPin} />
                {mon.locations.map((loc) => (
                  <Tag key={loc} size='lg' colorScheme='blue' mr='1em'>
                    {getMonitorLocationName(loc)}
                  </Tag>
                ))}
              </Flex>
            )}

            {stats && stats.week && <MonitorStatsView stats={stats.week} title='Last 7 Days' />}
            {stats && stats.day && <MonitorStatsView stats={stats.day} title='Last 24 Hours' />}
            <MonitorTimeChart id={id} width='800px' height='200px' />
          </>
        )}

        <Divider />
        <MonitorResultTable onShowMonitorResult={onShowMonitorResult} />
      </Grid>
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
  )
}
