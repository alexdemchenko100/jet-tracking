import { Box, Divider, Heading } from '@chakra-ui/react'
import { Monitor, MonitorResult } from '@httpmon/db'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useQuery } from 'react-query'
import axios from 'axios'

/**
 *
 * 1. Show given MonitorResult
 * 2. Given Monitor, execute ondemand and show result
 * 3. Given an id, retrieve monitor from server and show
 *
 */

type Mon = Pick<Monitor, 'method' | 'url'>
interface Props {
  monitor?: Mon
  result?: MonitorResult
}

export function APIResult(props?: Props) {
  const { state } = useLocation()

  if (state != null) {
    props = state as Props
  }

  let mon = props?.monitor

  const [result, setResult] = useState<MonitorResult>()

  props?.result && setResult(props?.result)

  async function getMonitorResult(mon?: Mon) {
    console.log('HEEEEEE')
    if (!mon) throw Error('Monitor must be given')

    let resp = await axios({
      method: 'POST',
      url: '/monitors/ondemand',
      data: { name: 'ondemand', frequency: 0, ...mon },
    })

    if (resp.status == 200) {
      const result = resp.data as MonitorResult
      setResult(result)
      return result
    }
    throw Error('Failed to get odemand results')
  }

  const { isLoading } = useQuery<MonitorResult, Error>(
    ['ondemand', mon],
    () => getMonitorResult(mon),
    {
      enabled: !!mon,
    }
  )

  return (
    <Box>
      <Heading size={'lg'} mb={'10'}>
        Result
      </Heading>
      <Divider />
      {JSON.stringify(props, null, 2)}
      {JSON.stringify(result, null, 2)}
    </Box>
  )
}
