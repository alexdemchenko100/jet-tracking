import {
  Badge,
  Box,
  Divider,
  Flex,
  FlexProps,
  Heading,
  Icon,
  Table,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react'
import { Monitor, MonitorResult, MonitorTuples } from '@httpmon/db'
import { useLocation } from 'react-router-dom'
import { useQuery } from 'react-query'
import axios from 'axios'
import { FiClock } from 'react-icons/fi'

/**
 *
 * 1. Show given MonitorResult
 * 2. Given Monitor, execute ondemand and show result
 * 3. Given an id, retrieve monitor from server and show
 *
 */

type Mon = Pick<Monitor, 'method' | 'url' | 'headers' | 'queryParams'>
interface Props {
  monitor: Mon
}

export function APIOnDemandResult(props: Props) {
  const { state } = useLocation()

  if (state != null) {
    props = state as Props
  }

  async function getMonitorResult(mon: Mon) {
    let resp = await axios({
      method: 'POST',
      url: '/monitors/ondemand',
      data: { name: 'ondemand', frequency: 0, ...mon },
    })

    if (resp.status == 200) {
      return resp.data as MonitorResult
    }

    throw Error('Failed to get odemand results')
  }

  const {
    isLoading,
    data: result,
    error,
  } = useQuery<MonitorResult, Error>(['ondemand', props.monitor], () =>
    getMonitorResult(props.monitor)
  )

  return (
    <>
      {isLoading && <p>Loading ...</p>}
      {error && <p>Err: {error.message}</p>}
      {result && <APIResult result={result} />}
    </>
  )
}

interface TimingBarProps extends FlexProps {
  result: MonitorResult
}
function TimingBar({ result, ...rest }: TimingBarProps) {
  let totalTime = result.totalTime

  /**
   *    Wait :: DNS :: TCP :: TLS :: Request-Upload :: FirstByte :: Download/Done
   */

  function calcPct(time: number) {
    return Math.ceil((100 * time) / result.totalTime)
  }

  let stats: [string, number, string][] = [
    // ['wait', calcPct(result.waitTime), 'brown.300'],
    ['tcp', calcPct(result.waitTime + result.tcpTime), 'blue.300'],
    ['dns', calcPct(result.dnsTime), 'yellow.300'],
    ['tls', calcPct(result.tlsTime), 'red.300'],
    ['req', calcPct(result.uploadTime), 'orange.300'],
    ['ttfb', calcPct(result.ttfb), 'purple.300'],
    ['dl', calcPct(result.downloadTime), 'green.300'],
  ]

  return (
    <Flex
      mt="2"
      border={'solid rounded 2px'}
      height={'16'}
      lineHeight={'8'}
      textAlign={'center'}
      verticalAlign={'middle'}
      {...rest}
    >
      {stats.map(([label, time, color]) => {
        if (time > 2)
          return (
            <Flex direction="column" width={`${time}%`} key={label}>
              <Text fontSize={'sm'} isTruncated>
                {label}
              </Text>
              <Box
                bg={color}
                fontSize={'sm'}
                verticalAlign={'middle'}
                ml={'0.5'}
              >
                {time}
              </Box>
            </Flex>
          )
      })}
    </Flex>
  )
}

export function APIResult({ result }: { result: MonitorResult }) {
  const isSuccessCode = (code: number) => code >= 200 && code < 300

  return (
    <Box>
      <Heading size={'md'} mb={'10'}>
        API Results
      </Heading>
      <Divider />
      <Box>
        <Badge
          colorScheme={isSuccessCode(result.code) ? 'green' : 'red'}
          fontSize={'md'}
          fontWeight={'bold'}
        >
          {result.code} {result.codeStatus}
        </Badge>

        <Tag colorScheme="gray" fontSize={'lg'} fontWeight={'bold'}>
          {result.url || 'unknown'}
        </Tag>
        <Tag colorScheme="gray" fontSize={'md'} fontWeight={'bold'} ml={'12'}>
          Response Time: {result.totalTime}ms
          <Icon ml={'1'} as={FiClock} />
        </Tag>

        <Heading size={'sm'} mt={'4'} mb={'3'}>
          Timings
        </Heading>

        <TimingBar width={'80%'} result={result} />

        <Heading size={'sm'} mt={'6'} mb={'3'}>
          Body ({result.bodySize} bytes)
        </Heading>

        {result.bodyJson && (
          <Box maxH={'400'} overflow={'auto'}>
            <code>
              <pre>{result.bodyJson}</pre>
            </code>
          </Box>
        )}

        {result.body && (
          <Box maxH={'400'} overflow={'auto'}>
            <code>
              <pre>{result.body}</pre>
            </code>
          </Box>
        )}

        <Heading size={'md'} mt={'4'}>
          Headers
        </Heading>

        <Box>
          <Table mt={'2'} variant={'striped'} size={'md'} maxW={'100%'}>
            <Thead>
              <Tr>
                <Th minW={'30%'}>Name</Th>
                <Th maxW={'70%'}>Value</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(result.headers as MonitorTuples).map((header) => {
                return (
                  <Tr key={header[0]}>
                    <Td fontWeight={'semibold'} color={'blue.500'}>
                      {header[0]}
                    </Td>
                    <Td>{header[1]} </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  )
}
