import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  FlexProps,
  Grid,
  Heading,
  Icon,
  Tab,
  Table,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { MonitorResult, MonitorTuples } from '@httpmon/db'
import { FiClock, FiX } from 'react-icons/fi'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'

import { Store } from '../services/Store'

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

  let stats: [string, number, number, string][] = [
    // ['wait', calcPct(result.waitTime), 'brown.300'],
    [
      'tcp',
      result.waitTime + result.tcpTime,
      calcPct(result.waitTime + result.tcpTime),
      'blue.300',
    ],
    ['dns', result.dnsTime, calcPct(result.dnsTime), 'yellow.300'],
    ['tls', result.tlsTime, calcPct(result.tlsTime), 'red.300'],
    ['req', result.uploadTime, calcPct(result.uploadTime), 'orange.300'],
    ['ttfb', result.ttfb, calcPct(result.ttfb), 'purple.300'],
    ['dl', result.downloadTime, calcPct(result.downloadTime), 'green.300'],
  ]

  return (
    <Flex
      mt='2'
      border='solid rounded 2px'
      height='16'
      lineHeight='8'
      textAlign='center'
      verticalAlign='middle'
      {...rest}
    >
      {stats.map(([label, time, timePct, color]) => {
        if (time > 2)
          return (
            <Flex direction='column' width={`${timePct}%`} key={label}>
              <Text fontSize='sm' isTruncated>
                {label}
              </Text>
              <Box bg={color} fontSize='sm' verticalAlign='middle' ml='0.5'>
                {time}
              </Box>
            </Flex>
          )
      })}
    </Flex>
  )
}

function AssertionResults({ result }: { result: MonitorResult }) {
  if (
    !result.assertResults ||
    !Array.isArray(result.assertResults) ||
    result.assertResults.length === 0
  ) {
    return (
      <Box>
        <Text fontSize='sm'>No assertions</Text>
      </Box>
    )
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Assertion</Th>
          <Th>Result</Th>
        </Tr>
      </Thead>
      <Tbody>
        {result.assertResults.map((res) => {
          return (
            <Tr key={res.name}>
              <Td>
                {res.type} {res.name} {res.op} {res.value}{' '}
              </Td>
              {res.fail ? (
                <Td>
                  <Badge colorScheme='red'>Failed</Badge>
                </Td>
              ) : (
                <Td>
                  <Badge colorScheme='green'>Passed</Badge>
                </Td>
              )}
            </Tr>
          )
        })}
      </Tbody>
    </Table>
  )
}

function formatBodySize(size: number) {
  if (size < 1024) {
    return `${size} B`
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)} MB`
  }
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function hasFailedAssertions(result: MonitorResult) {
  if (!Array.isArray(result.assertResults)) {
    return false
  }
  return result.assertResults?.some((res) => res.fail)
}

function isContentTypeJson(result: MonitorResult) {
  if (!Array.isArray(result.headers)) {
    return false
  }
  return result.headers.some(
    (header) => header[0].toLowerCase() === 'content-type' && header[1].includes('json')
  )
}

function getFormattedBody(result: MonitorResult) {
  if (isContentTypeJson(result) && result.body) {
    if (result.body.length > 0 && !result.body.match(/\n/))
      return JSON.stringify(JSON.parse(result.body), null, 2)
  }
  return result.body
}

interface APIResultProps {
  result: MonitorResult
  onClose?: () => void
}
export function APIResult({ result, onClose }: APIResultProps) {
  const isSuccessCode = (code: number) => code >= 200 && code < 300

  return (
    <Grid gap='1em' mx='2'>
      <Flex alignItems='center'>
        <Badge
          colorScheme={isSuccessCode(result.code) ? 'green' : 'red'}
          fontSize='md'
          fontWeight='bold'
        >
          {result.code} {result.codeStatus}
        </Badge>

        <Tag colorScheme='gray' fontSize='lg' fontWeight='bold'>
          {result.url || 'unknown'}
        </Tag>
        <Tag colorScheme='gray' fontSize='md' fontWeight='bold' ml='12'>
          Response Time: {result.totalTime}ms
          <Icon ml='1' as={FiClock} />
        </Tag>

        {onClose && (
          <Button ml='auto' onClick={onClose}>
            <Icon as={FiX} cursor='pointer' />
          </Button>
        )}
      </Flex>

      <TimingBar width='100%' result={result} />

      <Tabs
        defaultIndex={Store.ui.results.tabIndex}
        onChange={(index) => {
          Store.ui.results.tabIndex = index
        }}
        overflow='auto'
      >
        <TabList>
          <Tab>
            Body
            <Text color='green'>&nbsp;{formatBodySize(result.bodySize)}</Text>
          </Tab>
          <Tab>
            Headers
            {result.headers && <sup color='green'>&nbsp;{result.headers.length}</sup>}
          </Tab>

          <Tab>
            Tests
            {result.assertResults && (
              <sup color={hasFailedAssertions(result) ? 'red' : 'green'}>
                &nbsp;{result.assertResults.length}
              </sup>
            )}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <CodeMirror
              editable={false}
              value={getFormattedBody(result)}
              extensions={[javascript({ jsx: true })]}
            />
          </TabPanel>
          <TabPanel>
            <Table mt='2' variant='striped' size='md' maxW='100%'>
              <Thead>
                <Tr>
                  <Th minW='30%'>Name</Th>
                  <Th maxW='70%'>Value</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(result.headers as MonitorTuples).map((header) => {
                  return (
                    <Tr key={header[0] + header[1]}>
                      <Td fontWeight='semibold' color='blue.500'>
                        {header[0]}
                      </Td>
                      <Td>{header[1]} </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </TabPanel>
          <TabPanel>
            <AssertionResults result={result} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Grid>
  )
}
