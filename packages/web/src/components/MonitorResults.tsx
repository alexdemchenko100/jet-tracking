import { MonitorResult } from '@httpmon/db'
import axios from 'axios'
import { useQuery } from 'react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { useState } from 'react'
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
import { useParams } from 'react-router-dom'
import { APIResult } from './APIResult'

dayjs.extend(relativeTime)

const columns: Column<MonitorResult>[] = [
  {
    Header: 'When',
    accessor: (row, _index) => {
      return <span>{dayjs(row.createdAt as string).fromNow()}</span>
    },
  },
  {
    Header: 'Date',
    accessor: (row, _index) => {
      return <span>{dayjs(row.createdAt as string).format('YYYY-MM-DD h:mm:ss')}</span>
    },
  },
  {
    Header: 'Code',
    accessor: 'code',
  },
  {
    Header: 'Total Time',
    accessor: 'totalTime',
  },
]

export function MonitorResults() {
  const [currentResult, setCurrentResult] = useState<MonitorResult>()

  const { id } = useParams()

  async function getMonitorResults() {
    let resp = await axios({
      method: 'GET',
      url: '/monitors/' + id + '/results',
    })

    if (resp.status == 200) {
      const results = resp.data as MonitorResult[]
      return results
    }
    throw Error('Failed to get odemand results')
  }

  const { data: results } = useQuery<MonitorResult[], Error>(['monitor-result', id], () =>
    getMonitorResults()
  )

  const tableInstance = useTable(
    {
      columns,
      data: results ?? [],
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
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    state,
  } = tableInstance

  const { pageIndex } = state

  return (
    <>
      <Heading size='sm' mt='4' mb='4'>
        Monitor Results
      </Heading>
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
                    onClick={() => setCurrentResult(row.original)}
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

      {currentResult && <APIResult result={currentResult} />}
    </>
  )
}

export default MonitorResults
