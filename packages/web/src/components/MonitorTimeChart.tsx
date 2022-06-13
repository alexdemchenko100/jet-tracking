import { AxisOptions, Chart, UserSerie } from 'react-charts'
import React from 'react'
import { Box, BoxProps } from '@chakra-ui/react'
import { useQuery } from 'react-query'
import axios from 'axios'
import { MonitorResult } from '@httpmon/db'

type TotalTimeDatum = { date: Date; totalTime: number }

interface ChartProps extends BoxProps {
  id: string
}

export function MonitorTimeChart(props: ChartProps) {
  const { id } = props

  async function getMonitorResults() {
    let resp = await axios({
      method: 'GET',
      url: '/monitors/' + id + '/results',
    })

    if (resp.status == 200) {
      const results = resp.data as MonitorResult[]
      let byLocations: { [key: string]: MonitorResult[] } = {}
      results.forEach((res) => {
        if (!byLocations[res.location]) byLocations[res.location] = []
        byLocations[res.location].push(res)
      })

      const datum = Object.entries(byLocations).map(([location, byLocation]) => {
        const datum = byLocation.map((res) => {
          return {
            date: new Date(res.createdAt as string),
            totalTime: res.totalTime,
          }
        })
        return { label: location, data: datum }
      })
      return datum
    }

    throw Error('Failed to get odemand results')
  }

  const { data } = useQuery<UserSerie<TotalTimeDatum>[], Error>(['monitor-result-datum', id], () =>
    getMonitorResults()
  )

  const primaryAxis = React.useMemo(
    (): AxisOptions<TotalTimeDatum> => ({
      getValue: (datum) => datum.date as Date,
    }),
    []
  )

  const secondaryAxes = React.useMemo(
    (): AxisOptions<TotalTimeDatum>[] => [
      {
        getValue: (datum) => datum.totalTime,
      },
    ],
    []
  )

  return (
    <Box p='6' border='1px' borderColor='gray.200' borderStyle='solid' borderRadius={8} mt={4}>
      <Box {...props}>
        {data && data.length > 0 && (
          <Chart
            options={{
              data,
              primaryAxis,
              secondaryAxes,
            }}
          />
        )}
      </Box>
    </Box>
  )
}
