import { Monitor, MonitorStats, MonitorTable } from '@httpmon/db'
import axios from 'axios'
import { useQuery } from 'react-query'

import { useMemo, useState } from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Box,
  Button,
  IconButton,
  Flex,
  Input,
  Spacer,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuOptionGroup,
  MenuList,
  Heading,
  Tag,
} from '@chakra-ui/react'
import {
  TriangleDownIcon,
  TriangleUpIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons'

import { useTable, useSortBy, usePagination, Column } from 'react-table'
import { Navigate, useNavigate } from 'react-router-dom'
import { FiEdit, FiTrash2 } from 'react-icons/fi'
import { MdDelete, MdEdit } from 'react-icons/md'
import { frequencyMSToLabel } from '../services/FrequencyScale'

export function MonitorDashboard() {
  const navigate = useNavigate()

  async function getMonitors() {
    let resp = await axios({
      method: 'GET',
      url: '/monitors',
    })

    if (resp.status == 200) {
      const results = resp.data as Monitor[]
      return results
    }
    throw Error('Failed to get odemand results')
  }

  const { isLoading, data: monitors } = useQuery<Monitor[], Error>(
    ['monitors-list'],
    () => getMonitors(),
    {}
  )

  async function getMonitorStats() {
    let resp = await axios({
      method: 'GET',
      url: '/monitors/stats',
    })

    if (resp.status == 200) {
      const results = resp.data as MonitorStats[]
      return results
    }
    throw Error('Failed to get odemand results')
  }

  const { data: stats } = useQuery<MonitorStats[], Error>(['monitors-stats'], () =>
    getMonitorStats()
  )

  type MonitorsWithStats = Monitor & MonitorStats

  const columns = useMemo<Column<MonitorsWithStats>[]>(
    () => [
      {
        Header: 'Status',
        accessor: (row, _index) => {
          if (row.lastResults) {
            if (row.lastResults.length > 0) {
              return (
                <Tag
                  fontWeight='extrabold'
                  colorScheme={row.lastResults[0].err == '' ? 'green' : 'red'}
                >
                  {row.lastResults[0].err == '' ? 'OK' : 'ALERT'}
                </Tag>
              )
            }
          }
        },
      },
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Method',
        accessor: 'method',
        Cell: (c) => (
          <Tag size='sm' colorScheme='blue'>
            {c.cell.value}
          </Tag>
        ),
      },
      {
        Header: 'Url',
        accessor: 'url',
      },
      {
        Header: 'Frequency',
        accessor: (row, _index) => frequencyMSToLabel(row.frequency),
      },
      {
        Header: '24Hr Uptime',
        accessor: (row, _index) => (
          <Text>
            {(((row.day.numItems - row.day.numErrors) / row.day.numItems) * 100).toFixed()}%
          </Text>
        ),
      },
      {
        Header: '24Hr Avg',
        accessor: (row, _index) => row.day?.avg.toFixed() || 0,
      },
      {
        Header: '24 Hr Median',
        accessor: (row, _index) => row.day?.p50.toFixed() || 0,
      },
      {
        Header: '24 Hr P95',
        accessor: (row, _index) => row.day?.p95.toFixed() || 0,
      },

      {
        Header: '',
        accessor: (row, _rowIndex) => {
          return (
            <IconButton
              aria-label='Edit'
              onClick={(e) => {
                e.stopPropagation()
                navigate('/console/monitors/' + row.id + '/edit')
              }}
              icon={<MdEdit />}
              size='sm'
              color='blue.500'
              cursor='pointer'
            />
          )
        },
        id: 'action',
      },
    ],
    []
  )

  const monData = useMemo<MonitorsWithStats[]>(() => {
    if (!monitors || !stats) {
      return []
    }
    return monitors.map((mon) => {
      const stat = stats.find((s) => s.monitorId == mon.id)
      if (!stat) {
        return {} as MonitorsWithStats
      }
      return { ...mon, ...stat }
    })
  }, [monitors, stats])

  const tableInstance = useTable(
    {
      columns,
      data: monData ?? [],
      autoResetSortBy: false,
      autoResetPage: false,
    },
    useSortBy,
    usePagination
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    state,
    setSortBy,
    allColumns,
  } = tableInstance

  const { pageSize, pageIndex } = state

  const [selectedSortColumn, setSelectedSortColumn] = useState({
    id: '',
    desc: false,
  })

  function handleSort(e: any) {
    let temp = Object.assign({}, selectedSortColumn)
    temp['id'] = e
    setSelectedSortColumn(temp)
    setSortBy([temp])
  }

  const typeOfSort = (e: any) => {
    let tempColumn
    if (e == '0') {
      tempColumn = Object.assign({}, selectedSortColumn)
      tempColumn['desc'] = false
      setSelectedSortColumn(tempColumn)
      setSortBy([tempColumn])
    } else {
      tempColumn = Object.assign({}, selectedSortColumn)
      tempColumn['desc'] = true
      setSelectedSortColumn(tempColumn)
      setSortBy([tempColumn])
    }
  }

  return (
    <>
      <Flex justify='space-between'>
        <Heading size='md' mb='8'>
          Monitors
        </Heading>

        <Button
          size='sm'
          mr='2'
          mb='2'
          colorScheme='blue'
          onClick={() => navigate('/console/monitors/newapi')}
        >
          New Monitor
        </Button>
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
            {headerGroups.map((headerGroup, _indexKey) => (
              <Tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, _columnIndex) => (
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
                    cursor='pointer'
                    onClick={(e) => {
                      navigate('/console/monitors/' + row.original.id)
                    }}
                    {...row.getRowProps()}
                    sx={{ ':hover': { bgColor: 'gray.200' } }}
                  >
                    {row.cells.map((cell) => {
                      return (
                        <Td className='td1' color={'gray.600'} {...cell.getCellProps()}>
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
            aria-label='goto'
            _focus={{ boxShadow: '' }}
            _hover={{ backgroundColor: '' }}
            _active={{ backgroundColor: '' }}
            color='gray.800'
            bg='white'
            fontSize='15px'
            icon={<ArrowLeftIcon />}
            disabled={!canPreviousPage}
            onClick={() => gotoPage(0)}
          />
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
          <IconButton
            aria-label='gotoprev'
            _focus={{ boxShadow: '' }}
            _hover={{ backgroundColor: '' }}
            _active={{ backgroundColor: '' }}
            color='gray.800'
            bg='white'
            fontSize='15px'
            icon={<ArrowRightIcon />}
            disabled={!canNextPage}
            onClick={() => gotoPage(pageCount - 1)}
          />
          <Text
            m='0'
            alignSelf='center'
            borderRightColor=''
            defaultChecked={Boolean(pageIndex + 1)}
            borderColor='gray.300'
            fontWeight='bold'
            fontSize='sm'
            whiteSpace='nowrap'
          >
            Go to page
          </Text>
          <Input
            mx='5px'
            alignSelf='center'
            borderColor='gray.600'
            onChange={(e) => {
              let pageNumber = e.target.value ? Number(e.target.value) - 1 : 0
              gotoPage(pageNumber)
            }}
            w='10%'
            size='sm'
          />
        </Flex>
      </Flex>
    </>
  )
}

export default MonitorDashboard
