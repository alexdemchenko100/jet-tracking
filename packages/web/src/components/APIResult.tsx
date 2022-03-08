import {
  Badge,
  Box,
  Divider,
  Flex,
  Heading,
  Icon,
  Table,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
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
          {'FIXME'}
        </Tag>
        <Tag colorScheme="gray" fontSize={'md'} fontWeight={'bold'} ml={'12'}>
          Response Time: {result.totalTime}ms
          <Icon ml={'1'} as={FiClock} />
        </Tag>

        <Flex
          mt={'2'}
          bg={'blue.200'}
          border={'solid rounded 2px'}
          width={'80%'}
          height={'8'}
          textAlign={'center'}
          verticalAlign={'middle'}
        >
          <Box width={'12%'} bg={'green.300'}>
            12
          </Box>
          <Box width={'24%'} bg={'red.300'}>
            24
          </Box>
          <Box width={'4%'} bg={'purple.300'}>
            4
          </Box>
          <Box width={'44%'} bg={'brown.300'}>
            44
          </Box>
          <Box width={'16%'} bg={'orange.300'}>
            16
          </Box>
        </Flex>

        <Heading size={'md'} mt={'4'} mb={'3'}>
          Body
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
      )
    </Box>
  )
}
