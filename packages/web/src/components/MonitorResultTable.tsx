import { MonitorResult } from '@httpmon/db'
import axios from 'axios'
import { useQuery } from 'react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Box,
  IconButton,
  Flex,
  Spacer,
  Heading,
  Tag,
  useDisclosure,
} from '@chakra-ui/react'
import {
  TriangleDownIcon,
  TriangleUpIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ArrowLeftIcon,
} from '@chakra-ui/icons'

import { useTable, useSortBy, usePagination, Column, useRowSelect } from 'react-table'
import { useParams } from 'react-router-dom'
import { Select } from 'chakra-react-select'
import { DatePicker } from './DatePicker/DatePicker'
import { useState } from 'react'

type FilterOptionType = {
  label: string
  value: string
}

dayjs.extend(relativeTime)

const columns: Column<MonitorResult>[] = [
  {
    Header: 'Status',
    accessor: (row, _index) => {
      return <>{row.err ? <Tag color='red'>FAIL</Tag> : <Tag color='green'>OK</Tag>}</>
    },
  },
  {
    Header: 'When',
    accessor: (row, _index) => {
      return (
        <>
          <Text as='span'>{dayjs(row.createdAt as string).fromNow()}</Text>&nbsp;&nbsp;
          <Text as='span' fontStyle='italic'>
            {dayjs(row.createdAt as string).format('M/DD/YY h:mm A')}
          </Text>
        </>
      )
    },
  },
  {
    Header: 'Code',
    accessor: 'code',
  },
  {
    Header: 'Location',
    accessor: 'location',
  },
  {
    Header: () => 'Time Taken',
    accessor: 'totalTime',
  },
]

interface MonitorResultTableProps {
  onShowMonitorResult: (monitorId: string) => void
}

export function MonitorResultTable({ onShowMonitorResult }: MonitorResultTableProps) {
  const { id } = useParams()

  const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day').toDate())
  const [endDate, setEndDate] = useState(dayjs().toDate())
  const [locations, setLocations] = useState<FilterOptionType[]>()
  const [status, setStatus] = useState<FilterOptionType>()
  const [timePeriod, setTimePeriod] = useState<FilterOptionType>()

  function onSetLocation(value: FilterOptionType[]) {
    if (value.some((v) => v.value === 'all')) {
      setLocations(undefined)
      return
    }
    setLocations(value)
  }

  function onSetStatus(value: FilterOptionType) {
    if (value.value === 'all') {
      setStatus(undefined)
      return
    }
    setStatus(value)
  }

  async function getMonitorResults() {
    let resp = await axios({
      method: 'GET',
      url: '/monitors/' + id + '/resultsEx',
      params: {
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        locations:
          locations && locations.length > 0 ? locations?.map((v) => v.value).join(',') : undefined,
        status: status?.value,
      },
    })

    if (resp.status == 200) {
      const results = resp.data as MonitorResult[]
      return results
    }
    throw Error('Failed to get odemand results')
  }

  const { data: results } = useQuery<MonitorResult[], Error>(
    ['monitor-result', id, locations, status],
    () => getMonitorResults()
  )

  const tableInstance = useTable(
    {
      columns,
      data: results ?? [],
      autoResetSortBy: false,
      autoResetPage: false,
      autoResetSelectedRows: false,
    },
    useSortBy,
    usePagination,
    useRowSelect
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    state,
    toggleRowSelected,
    toggleAllRowsSelected,
  } = tableInstance

  const { pageIndex } = state
  const drawer = useDisclosure()

  return (
    <>
      <Heading size='sm' mb='4'>
        Monitor Results
      </Heading>
      <Flex zIndex='2'>
        <Box width='200px'>
          <Select
            defaultValue={{
              label: 'Last 1 Hour',
              value: 'last-hour',
            }}
            value={timePeriod}
            onChange={(value) => {
              setTimePeriod(value as FilterOptionType)
            }}
            placeholder='Time Period'
            options={[
              {
                label: 'Last 1 Hour',
                value: 'last-hour',
              },
              {
                label: 'Last Day',
                value: 'last-day',
              },
              {
                label: 'Last Week',
                value: 'last-week',
              },
              {
                label: 'Last 20 Entries',
                value: 'last-20',
              },
            ]}
          />
        </Box>
        {/* <DatePicker selected={startDate} onChange={(date: Date) => setStartDate(date)} /> */}
        <Box width='400px'>
          <Select
            isMulti
            placeholder='All Locations'
            value={locations}
            onChange={(value) => onSetLocation(value as FilterOptionType[])}
            options={[
              {
                label: 'US-East',
                value: 'us-east',
              },
              {
                label: 'Europe-West',
                value: 'europe-west',
              },
              {
                label: 'All Locations',
                value: 'all',
              },
            ]}
          />
        </Box>
        <Box width='200px' ml='4'>
          <Select
            placeholder='All results'
            value={status}
            onChange={(value) => onSetStatus(value as FilterOptionType)}
            options={[
              {
                label: 'Success',
                value: 'success',
              },
              {
                label: 'Failed',
                value: 'fail',
              },
              {
                label: 'All Results',
                value: 'all',
              },
            ]}
          />
        </Box>
      </Flex>

      <Box maxH='30em' overflowY='scroll'>
        <Table {...getTableProps()} size='sm' variant='simple'>
          <Thead
            p='0'
            position='sticky'
            zIndex='1'
            top='0px'
            style={{ overflow: 'scroll' }}
            bg='gray.100'
          >
            {headerGroups.map((headerGroup) => (
              <Tr p='0' {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <Th
                    borderColor='gray.200'
                    p='1em'
                    className='th1'
                    color={'gray.800'}
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                  >
                    {/* This will render the Title of column */}
                    {column.render('Header')}
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <TriangleDownIcon />
                      ) : (
                        <TriangleUpIcon />
                      )
                    ) : (
                      ''
                    )}
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>

          <Tbody className='body1' p='1em' {...getTableBodyProps()}>
            {page && page.length > 0 ? (
              page.map((row) => {
                prepareRow(row)
                return (
                  <Tr
                    className='tr1'
                    onClick={() => {
                      if (row.original.id) {
                        onShowMonitorResult(row.original.id)
                      }
                      toggleAllRowsSelected(false)
                      toggleRowSelected(row.id, true)
                    }}
                    bgColor={row.isSelected ? 'gray.300' : 'auto'}
                    sx={{ ':hover': { bgColor: 'gray.200' } }}
                    {...row.getRowProps()}
                  >
                    {row.cells.map((cell) => {
                      return (
                        <Td className='td1' color='gray.600' {...cell.getCellProps()}>
                          {cell.render('Cell')}{' '}
                        </Td>
                      )
                    })}
                  </Tr>
                )
              })
            ) : (
              <Text textAlign='center' fontSize='1em' mx='auto'>
                No Data Found
              </Text>
            )}
          </Tbody>
        </Table>
      </Box>
      <Flex borderTop='5px solid' borderColor='gray.200' justifyContent='flex-end'>
        <Spacer />
        <Flex alignContent='center'>
          <IconButton
            aria-label='prev'
            _focus={{ boxShadow: '' }}
            _hover={{ backgroundColor: '' }}
            _active={{ backgroundColor: '' }}
            color='gray.800'
            bg='white'
            fontSize='30px'
            icon={<ChevronLeftIcon />}
            disabled={!canPreviousPage}
            onClick={() => previousPage()}
          />
          <Text m='0' alignSelf='center'>
            {pageIndex + 1} - {pageOptions.length}{' '}
          </Text>
          <IconButton
            aria-label='next'
            _focus={{ boxShadow: '' }}
            _hover={{ backgroundColor: '' }}
            _active={{ backgroundColor: '' }}
            color='gray.800'
            bg='white'
            fontSize='30px'
            icon={<ChevronRightIcon />}
            disabled={!canNextPage}
            onClick={() => nextPage()}
          />
        </Flex>
      </Flex>
    </>
  )
}

export default MonitorResultTable
