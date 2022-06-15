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
  Box,
  IconButton,
  Flex,
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
import Text from '../components/Text'

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
      return (
        <>
          {row.err ? (
            <Flex alignItems={'center'}>
              <Box w={2} h={2} borderRadius={8} bg={'red.200'} mr={2}></Box>
              <Text variant='paragraph' color='gray.300'>Alert</Text>
            </Flex>
          ) : (
            <Flex alignItems={'center'}>
              <Box w={2} h={2} borderRadius={8} bg={'green.200'} mr={2}></Box>
              <Text variant='paragraph' color='gray.300'>Ok</Text>
            </Flex>
          )}
        </>
      )
    },
  },
  {
    Header: 'When',
    accessor: (row, _index) => {
      return (
        <Text variant='paragraph' color='gray.300' className='captialize-first-letter' display='inline-block' whiteSpace='nowrap'>
          {dayjs(row.createdAt as string).fromNow()}&nbsp;&nbsp;{dayjs(row.createdAt as string).format('M/DD/YY h:mm A')}
        </Text>
      )
    },
  },
  {
    Header: 'Code',
    accessor: (row) => (
      <Text variant='paragraph' color='gray.300' textTransform={'capitalize'}>
        {row.code}
      </Text>
    ),
  },
  {
    Header: 'Location',
    accessor: (row, _index) => {
      return <Text variant='paragraph' color='gray.300' textTransform={'capitalize'}>{getMonitorLocationName(row.location)}</Text>
    },
  },
  {
    Header: 'Time Taken',
    accessor: (row) => (
      <Text variant='paragraph' color='gray.300' textTransform={'capitalize'}>
        {row.totalTime}
      </Text>
    ),
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
      <Flex alignItems='center' flexWrap='wrap' justifyContent='space-between'>
        <Text variant='title' color='black' mb={4}>
          Monitor Results ({totalItemCount})
        </Text>
        <Flex zIndex='2' flexWrap='wrap'>
          <Box minWidth='230px' mr={4} mb={3}>
            <Select
              value={timePeriod}
              onChange={(value) => {
                const timePeriod = value as FilterOptionType
                setTimePeriod(timePeriod)
              }}
              placeholder='Time Period'
              options={TimePeriods}
              chakraStyles={{
                dropdownIndicator: (provided) => ({
                  ...provided,
                  bg: "transparent",
                  px: 2,
                  cursor: "inherit"
                }),
                indicatorSeparator: (provided) => ({
                  ...provided,
                  display: "none"
                })
              }}
            />
          </Box>
          {/* <DatePicker selected={startDate} onChange={(date: Date) => setStartDate(date)} /> */}
          <Box minWidth='400px' mr={4} mb={3}>
            <Select
              isMulti
              placeholder='All Locations'
              value={locations}
              onChange={(value) => setLocations(value as FilterOptionType[])}
              options={LocationOptions}
              chakraStyles={{
                dropdownIndicator: (provided) => ({
                  ...provided,
                  bg: "transparent",
                  px: 2,
                  cursor: "inherit"
                }),
                indicatorSeparator: (provided) => ({
                  ...provided,
                  display: "none"
                })
              }}
            />
          </Box>
          <Box minWidth='230px'>
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
              chakraStyles={{
                dropdownIndicator: (provided) => ({
                  ...provided,
                  bg: "transparent",
                  px: 2,
                  cursor: "inherit"
                }),
                indicatorSeparator: (provided) => ({
                  ...provided,
                  display: "none"
                })
              }}
            />
          </Box>
        </Flex>
      </Flex>

      <Box mt={6} overflowX={'auto'}>
        <Table {...getTableProps()} size='sm' variant='simple'>
          <Thead
            p='0'
            position='sticky'
            zIndex='1'
            top='0px'
            style={{ overflow: 'scroll' }}
          >
            {headerGroups.map((headerGroup) => (
              <Tr p='0' {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <Th
                    borderColor='lightgray.100'
                    p='11px 16px'
                    textTransform='capitalize'
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                  >
                    <Flex alignItems={'center'}>
                      <Text mr={2} variant='emphasis' color='black'>{column.render('Header')}</Text>
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          <TriangleDownIcon />
                        ) : (
                          <TriangleUpIcon />
                        )
                      ) : (
                        ''
                      )}
                    </Flex>
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
                    bgColor={row.isSelected ? 'gray.200' : 'auto'}
                    sx={{ ':hover': { bgColor: 'lightgray.100' } }}
                    {...row.getRowProps()}
                  >
                    {row.cells.map((cell) => {
                      return (
                        <Td className='td1' color='gray.600' py={3} {...cell.getCellProps()}>
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
                  <Text textAlign='center' variant='text-field' color='black' mx='auto'>
                    No Data Found
                  </Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
      <Flex borderBottom='1px solid' p='1' borderColor='lightgray.100' alignItems='center' justifyContent='space-between'>
        <Text variant='text-field' color='gray.300'>Show 10 results of {totalItemCount}</Text>
        <Flex alignItems='center'>
          <IconButton
            aria-label='prev'
            _focus={{ boxShadow: '' }}
            _hover={{ backgroundColor: '' }}
            _active={{ backgroundColor: '' }}
            color='darkblue.100'
            bg='transparent'
            fontSize='30px'
            icon={<ChevronLeftIcon />}
            disabled={!canPreviousPage}
            onClick={() => previousPage()}
          />
          <Text mx='1.5' variant='emphasis' color='darkblue.100' alignSelf='center'>{pageIndex + 1}&nbsp;&nbsp;/</Text>
          <Text variant='paragraph' color='gray.300' alignSelf='center'>{pageOptions.length}</Text>
          <IconButton
            aria-label='next'
            _focus={{ boxShadow: '' }}
            _hover={{ backgroundColor: '' }}
            _active={{ backgroundColor: '' }}
            color='darkblue.100'
            bg='transparent'
            fontSize='30px'
            icon={<ChevronRightIcon />}
            disabled={!canNextPage}
            onClick={() => nextPage()}
          />
        </Flex>
        <Text variant='text-field' color='transparent'>Show 10 results of {totalItemCount}</Text>
      </Flex>
    </>
  )
}

export default MonitorResultTable
