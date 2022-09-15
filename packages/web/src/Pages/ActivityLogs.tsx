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
import { ActivityLog } from '@httpmon/db'

interface ActivityLogExt extends ActivityLog {
  date?: string
  time?: string
}

const PAGE_SIZE = 20

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
                      <Flex direction={'column'} align='flex-start' gap='1'>
                        <Text variant='details' color='gray.300'>
                          {log.time}
                        </Text>
                        <Text className='activity-title' variant='text-field' color='black'>
                          {(log.data as Record<string, string>)?.msg ?? ''}
                        </Text>
                        {log.type !== 'MONITOR_REMOVED' && log.monitorId && (
                          <Box mt='-1' as={Link} to={`/console/monitors/${log.monitorId}`}>
                            <Text
                              variant='details'
                              color='gray.300'
                              textTransform='lowercase'
                              textDecoration='underline'
                              wordBreak='break-all'
                            >
                              {`https://localhost:3000/console/monitors/${log.monitorId}`}
                            </Text>
                          </Box>
                        )}
                      </Flex>
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
