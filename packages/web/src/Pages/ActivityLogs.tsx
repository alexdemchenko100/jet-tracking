import { Box, Flex, Icon } from '@chakra-ui/react'
import groupBy from 'lodash.groupby'
import dayjs from 'dayjs'
import { Section, Text } from '../components'
import { FiActivity, FiMonitor } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Fragment, useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import axios from 'axios'
import { ActivityLog, LogDetails } from '@httpmon/db'

interface ActivityLogExt extends ActivityLog {
  date?: string
  time?: string
}

const PAGE_SIZE = 20

function LogBox({ log }: { log: ActivityLogExt }) {
  if (!log.monitorId) {
    return (
      <Flex direction={'column'} align='flex-start' gap='1'>
        <Text variant='details' color='gray.300'>
          {log.time}
        </Text>
        <Text className='activity-title' variant='text-field' color='black'>
          Monitor&nbsp;{(log.data as LogDetails)?.monitorName}&nbsp;is&nbsp;
          {(log.data as LogDetails)?.msg}.
        </Text>
      </Flex>
    )
  }

  return (
    <Flex direction={'column'} align='flex-start' gap='1'>
      <Text variant='details' color='gray.300'>
        {log.time}
      </Text>
      {log.type === 'MONITOR_RECOVERED' || log.type === 'MONITOR_DOWN' ? (
        <Text className='activity-title' variant='text-field' color='black'>
          Monitor&nbsp;
          <Box
            as={Link}
            color='darkblue.100'
            textDecoration='underline'
            to={`/console/monitors/${log.monitorId}`}
          >
            {(log.data as LogDetails)?.monitorName}
          </Box>
          &nbsp;is&nbsp;
          <Box
            as={Link}
            color='darkblue.100'
            textDecoration='underline'
            to={`/console/apiruns/${log.resultId}`}
          >
            {(log.data as LogDetails)?.msg}
          </Box>
          .
        </Text>
      ) : (
        <Text className='activity-title' variant='text-field' color='black'>
          Monitor&nbsp;
          <Box
            as={Link}
            color='darkblue.100'
            textDecoration='underline'
            to={`/console/monitors/${log.monitorId}`}
          >
            {(log.data as LogDetails)?.monitorName}
          </Box>
          &nbsp;is&nbsp;{(log.data as LogDetails)?.msg}.
        </Text>
      )}
      {log.type === 'MONITOR_RECOVERED' || log.type === 'MONITOR_DOWN' ? (
        <Flex mt='2' gap='1.5' direction='column'>
          <Flex gap={4}>
            <Flex direction='column'>
              <Text variant='submenu' color='black'>
                <strong>URL</strong>
              </Text>
              <Box as={Link} whiteSpace='nowrap' to={(log.data as LogDetails)?.url || ''}>
                <Text variant='submenu' color='darkblue.100'>
                  {(log.data as LogDetails)?.url}
                </Text>
              </Box>
            </Flex>
            <Flex direction='column'>
              <Text variant='submenu' color='black'>
                <strong>Location</strong>
              </Text>
              <Text mt={1} variant='submenu' color='black'>
                {(log.data as LogDetails)?.location}
              </Text>
            </Flex>
          </Flex>
          {(log.data as LogDetails)?.err && (
            <Flex direction='column'>
              <Text variant='submenu' color='black'>
                <strong>Reason</strong>
              </Text>
              <Text
                mt={1}
                variant='submenu'
                color='black'
                bg='gray.100'
                borderRadius={5}
                p='0.5'
                px='1'
                width='max-content'
              >
                {(log.data as LogDetails)?.err}
              </Text>
            </Flex>
          )}
          {(log.data as LogDetails)?.assertResults?.map((result) => (
            <Flex alignItems='center'>
              <Text variant='submenu' textTransform='capitalize' color='black'>
                <strong>
                  <em>{result.type}</em>
                </strong>
              </Text>
              <Text variant='submenu' color='black'>
                &nbsp; expected <strong>{result.value}</strong> but got&nbsp;
              </Text>
              <Text variant='submenu' color='red.200' bg='gray.100' borderRadius={5} p='0.5' px='1'>
                <strong>{result.fail}</strong>
              </Text>
            </Flex>
          ))}
        </Flex>
      ) : (
        <Box mt='-1' as={Link} to={`/console/monitors/${log.monitorId}`}>
          <Text
            variant='details'
            color='gray.300'
            textTransform='lowercase'
            textDecoration='underline'
            wordBreak='break-all'
          >
            {`/console/monitors/${log.monitorId}`}
          </Text>
        </Box>
      )}
    </Flex>
  )
}

export default function ActivityLogs() {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [logs, setLogs] = useState<ActivityLogExt[]>([])
  const [totalCount, setTotalCount] = useState<number | undefined>()

  useEffect(() => {
    document.title = 'Activity Log | ProAutoma'
  }, [])

  useQuery(
    ['activitylogs', currentPage],
    async () => {
      const offset = (currentPage - 1) * PAGE_SIZE
      if (!totalCount || offset < totalCount) {
        const resp = await axios({
          method: 'GET',
          url: '/activity-logs',
          params: {
            offset,
            limit: PAGE_SIZE,
          },
        })
        const { items, total } = resp.data
        const data = items.map((item: ActivityLogExt) => {
          item.date = dayjs(item.createdAt as string).format('MMMM D')
          item.time = dayjs(item.createdAt as string).format('HH:mm')
          return item
        })
        setLogs(logs.concat(data))
        setTotalCount(total)
      }
    },
    { refetchOnWindowFocus: false }
  )

  const loadMore = () => {
    setCurrentPage(currentPage + 1)
  }

  const getLogBg = (state: string) => {
    switch (state) {
      case 'MONITOR_UP':
        return 'darkblue.100'
      case 'MONITOR_RECOVERED':
        return 'cyan.400'
      case 'MONITOR_DOWN':
        return 'pink.400'
      case 'MONITOR_PAUSED':
        return 'gold.200'
      case 'MONITOR_REMOVED':
        return 'red.200'
      case 'MONITOR_CREATED':
        return 'green.200'
      default:
    }
  }

  const groupedLogs = groupBy(logs, (a) => a.date)

  return (
    <Section py={4} minH='calc(100vh - 75px)' mb='0'>
      <Box mb={10}>
        <Text variant='header' color='darkgray.100'>
          Activity Logs
        </Text>
      </Box>
      <InfiniteScroll
        dataLength={currentPage}
        next={loadMore}
        hasMore={currentPage < 10}
        loader={<div></div>}
      >
        <Fragment key={currentPage}>
          {Object.keys(groupedLogs).map((group) => (
            <Box key={`${group}-${currentPage}`}>
              <Flex alignItems='center' gap={5} my='1'>
                <Icon color='darkgray.100' as={FiActivity} cursor='pointer' />
                <Text variant='title' color='darkgray.100'>
                  {group}
                </Text>
              </Flex>
              <Box ml={10}>
                <Box w='0.5' h='10' ml='7px' bg='lightgray.100'></Box>
                {groupedLogs[group].map((log, index) => (
                  <Flex key={`${group}-${currentPage}-${index}`}>
                    <Flex direction='column'>
                      <Flex
                        align='center'
                        justify='center'
                        bg={getLogBg(log.type)}
                        borderRadius='16'
                        w='7'
                        h='7'
                        p='1.5'
                        my='1'
                        mx='-1.5'
                      >
                        <Icon color='white' as={FiMonitor} cursor='pointer' />
                      </Flex>
                      <Box w='0.5' minH='20' flex='1' ml='7px' bg='lightgray.100'></Box>
                    </Flex>
                    <Flex
                      ml='8'
                      p='3'
                      pr='6'
                      mt='-2'
                      gap={5}
                      borderRadius='8'
                      height='100%'
                      overflow='hidden'
                      _hover={{ bg: 'blue.50' }}
                    >
                      <LogBox log={log} />
                    </Flex>
                  </Flex>
                ))}
              </Box>
            </Box>
          ))}
        </Fragment>
      </InfiniteScroll>
    </Section>
  )
}
