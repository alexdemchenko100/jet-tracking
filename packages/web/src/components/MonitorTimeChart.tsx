import { AxisOptions, Chart } from 'react-charts'
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
      const datum = (resp.data as MonitorResult[]).map((res) => {
        return {
          date: new Date(res.createdAt as string),
          totalTime: res.totalTime,
        }
      })
      return datum
    }
    throw Error('Failed to get odemand results')
  }

  const { data: results } = useQuery<TotalTimeDatum[], Error>(['monitor-result-datum', id], () =>
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
    <Box {...props}>
      {results && results.length > 0 && (
        <Chart
          options={{
            data: [
              {
                label: 'Request Time',
                data: results,
              },
            ],
            primaryAxis,
            secondaryAxes,
          }}
        />
      )}
    </Box>
  )
}
