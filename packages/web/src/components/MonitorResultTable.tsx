import { MonitorResult, MonitorResultQuery } from '@httpmon/db'
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
} from '@chakra-ui/react'
import {
  TriangleDownIcon,
  TriangleUpIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from '@chakra-ui/icons'

import { useTable, useSortBy, usePagination, Column, useRowSelect } from 'react-table'
import { useParams } from 'react-router-dom'
import { Select } from 'chakra-react-select'
import { useEffect, useMemo, useReducer, useState } from 'react'
import { getMonitorLocationName, MonitorLocations } from '../services/MonitorLocations'
import { TimePeriods, useTimePeriod } from '../services/MonitorTimePeriod'

type FilterOptionType = {
  label: string
  value: string
  colorScheme?: string
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
    accessor: (row, _index) => {
      return <Text>{getMonitorLocationName(row.location)}</Text>
    },
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

  const [locations, setLocations] = useState<FilterOptionType[]>()
  const [status, setStatus] = useState<FilterOptionType[]>()
  const [totalItemCount, setTotalItemCount] = useState<number>()
  const { startDate, endDate, timePeriod, setTimePeriod } = useTimePeriod()

  type PaginationState = {
    queryPageIndex: number
    queryPageSize: number
    totalItemCount?: number
  }

  const initialState: PaginationState = {
    queryPageIndex: 0,
    queryPageSize: 10,
  }

  const PAGE_CHANGED = 'PAGE_CHANGED'
  const PAGE_SIZE_CHANGED = 'PAGE_SIZE_CHANGED'
  const TOTAL_COUNT_CHANGED = 'TOTAL_COUNT_CHANGED'

  const reducer = (
    state: PaginationState,
    { type, payload }: { type: string; payload: number }
  ) => {
    switch (type) {
      case PAGE_CHANGED:
        return {
          ...state,
          queryPageIndex: payload,
        }
      case PAGE_SIZE_CHANGED:
        return {
          ...state,
          queryPageSize: payload,
        }
      case TOTAL_COUNT_CHANGED:
        return {
          ...state,
          totalCount: payload,
        }
      default:
        throw new Error(`Unhandled action type: ${type}`)
    }
  }

  async function getMonitorResults(offset: number, limit: number) {
    let resp = await axios({
      method: 'GET',
      url: '/monitors/' + id + '/resultsEx',
      params: {
        startTime: startDate,
        endTime: endDate,
        locations:
          locations && locations.length > 0 ? locations?.map((v) => v.value).join(',') : undefined,
        status: status && status.length > 0 ? status?.map((v) => v.value).join(',') : undefined,
        offset,
        limit,
        getTotals: true,
      },
    })

    if (resp.status == 200) {
      const results = resp.data as MonitorResultQuery
      return results
    }
    throw Error('Failed to get odemand results')
  }

  const [{ queryPageIndex, queryPageSize }, dispatch] = useReducer(reducer, initialState)

  const { data: resultQueryResp } = useQuery<MonitorResultQuery, Error>(
    [
      'monitor-result',
      id,
      locations,
      status,
      timePeriod,
      startDate,
      endDate,
      queryPageIndex,
      queryPageSize,
    ],
    () => getMonitorResults(queryPageIndex * queryPageSize, queryPageSize),
    {
      staleTime: Infinity,
    }
  )

  if (resultQueryResp?.totalItemCount) {
    if (resultQueryResp.totalItemCount != totalItemCount) {
      setTotalItemCount(resultQueryResp.totalItemCount)
    }
  }

  const tableInstance = useTable(
    {
      columns,
      data: resultQueryResp?.items ?? [],
      autoResetSortBy: false,
      autoResetPage: false,
      autoResetSelectedRows: false,
      initialState: {
        pageIndex: queryPageIndex,
        pageSize: queryPageSize,
      },
      manualPagination: true, // Tell the usePagination
      // hook that we'll handle our own data fetching
      // This means we'll also have to provide our own
      // pageCount.
      pageCount: totalItemCount ? Math.ceil(totalItemCount / queryPageSize) : undefined,
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
    pageCount,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    gotoPage,
    pageOptions,
    state,
    toggleRowSelected,
    toggleAllRowsSelected,
  } = tableInstance

  const { pageIndex, pageSize } = state

  useEffect(() => {
    dispatch({ type: PAGE_CHANGED, payload: pageIndex })
  }, [pageIndex])

  useEffect(() => {
    dispatch({ type: PAGE_SIZE_CHANGED, payload: pageSize })
    gotoPage(Math.min(pageIndex, pageCount - 1))
  }, [pageSize, pageCount, gotoPage])

  const LocationOptions = useMemo(
    () =>
      MonitorLocations.map((loc) => {
        return {
          label: loc.name,
          value: loc.region,
        }
      }),
    [MonitorLocations]
  )

  return (
    <>
      <Heading size='sm' mb='4'>
        Monitor Results &nbsp; {totalItemCount}
      </Heading>
      <Flex zIndex='2'>
        <Box width='200px'>
          <Select
            value={timePeriod}
            onChange={(value) => {
              const timePeriod = value as FilterOptionType
              setTimePeriod(timePeriod)
            }}
            placeholder='Time Period'
            options={TimePeriods}
          />
        </Box>
        {/* <DatePicker selected={startDate} onChange={(date: Date) => setStartDate(date)} /> */}
        <Box width='400px'>
          <Select
            isMulti
            placeholder='All Locations'
            value={locations}
            onChange={(value) => setLocations(value as FilterOptionType[])}
            options={LocationOptions}
          />
        </Box>
        <Box width='280px' ml='4'>
          <Select
            isMulti
            placeholder='All Results'
            value={status}
            onChange={(value) => setStatus(value as FilterOptionType[])}
            options={[
              {
                label: 'OK',
                value: 'ok',
                colorScheme: 'green',
              },
              {
                label: 'Error',
                value: 'error',
                colorScheme: 'red',
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
              <Tr>
                <Td>
                  <Text textAlign='center' fontSize='1em' mx='auto'>
                    No Data Found
                  </Text>
                </Td>
              </Tr>
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
