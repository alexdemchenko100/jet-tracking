import {
  Badge,
  Box,
  Code,
  Divider,
  Flex,
  Heading,
  Icon,
  Table,
  TableCaption,
  Tag,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { Monitor, MonitorResult, MonitorTuples } from '@httpmon/db'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useQuery } from 'react-query'
import axios from 'axios'
import { FiClock } from 'react-icons/fi'

export function ResultsDashboard() {
  const [results, setResults] = useState<MonitorResult[]>()

  async function getMonitorResults() {
    let resp = await axios({
      method: 'GET',
      url: '/monitors/results',
      data: {},
    })

    if (resp.status == 200) {
      const results = resp.data as MonitorResult[]
      setResults(results)
      return results
    }
    throw Error('Failed to get odemand results')
  }

  const { isLoading } = useQuery<MonitorResult[], Error>(
    'results-dashboard',
    () => getMonitorResults(),
    {}
  )

  function isSuccessCode(code: number) {
    return code >= 200 && code < 300
  }

  return (
    <Box>
      <Heading size={'lg'} mb={'10'}>
        Monitor Results
      </Heading>
      <Divider />

      <Box>
        {results &&
          results.map((result, _) => {
            return (
              <Box key={result.id}>
                <Badge
                  colorScheme={isSuccessCode(result.code) ? 'green' : 'red'}
                  fontSize={'md'}
                  fontWeight={'bold'}
                >
                  {result.code} {result.codeStatus}{' '}
                </Badge>

                <Tag colorScheme="gray" fontSize={'lg'} fontWeight={'bold'}>
                  {/* {mon.url} */} URL HERE
                </Tag>
                <Tag
                  colorScheme="gray"
                  fontSize={'md'}
                  fontWeight={'bold'}
                  ml={'12'}
                >
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
          })}
      </Box>
    </Box>
  )
}
