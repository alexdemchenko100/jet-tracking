import { Monitor, MonitorResult } from '@httpmon/db'
import { useLocation } from 'react-router-dom'
import { useQuery } from 'react-query'
import axios from 'axios'
import { APIResult } from './APIResult'

type OnDemandMon = Pick<Monitor, 'method' | 'url' | 'headers' | 'queryParams'>
interface Props {
  onDemandMonitor?: OnDemandMon
}

export function APIResultByDemand(props: Props) {
  const { state } = useLocation()

  if (state != null) {
    props = state as Props
  }

  async function getOndemandMonitorResponse(mon: OnDemandMon) {
    let resp = await axios({
      method: 'POST',
      url: '/monitors/ondemand',
      data: { ...mon, name: 'ondemand', frequency: 86400 },
    })

    if (resp.status == 200) {
      return resp.data as MonitorResult
    }

    throw Error('Failed to get odemand results')
  }

  const {
    isLoading,
    data: result,
    error,
  } = useQuery<MonitorResult, Error>(
    ['ondemand', props.onDemandMonitor],
    () => getOndemandMonitorResponse(props.onDemandMonitor as OnDemandMon),
    {
      enabled: props.onDemandMonitor != null,
    }
  )

  return (
    <>
      {isLoading && <p>Loading ...</p>}
      {error && <p>Err: {error.message}</p>}
      {!props.onDemandMonitor && <p>Results will be shown here</p>}
      {result && <APIResult result={result} />}
    </>
  )
}
