import dayjs from 'dayjs'
import { useState } from 'react'
import { Store } from './Store'

export type TimePeriod = {
  label: string
  value: string
}

export const TimePeriods = [
  {
    label: 'Last 1 Hour',
    value: 'last-hour',
  },
  {
    label: 'Last 4 Hours',
    value: 'last-4-hours',
  },
  {
    label: 'Last 24 Hours',
    value: 'last-day',
  },
  {
    label: 'Last Week',
    value: 'last-week',
  },
  {
    label: 'Last Month',
    value: 'last-month',
  },
]

function getTimePeriodRange(timePeriod?: string) {
  switch (timePeriod) {
    case 'last-week':
      return [dayjs().subtract(7, 'day').toISOString(), dayjs().toISOString()]
    case 'last-month':
      return [dayjs().subtract(1, 'month').toISOString(), dayjs().toISOString()]
    case 'last-day':
      return [dayjs().subtract(24, 'hour').toISOString(), dayjs().toISOString()]
    case 'last-hour':
      return [dayjs().subtract(1, 'hour').toISOString(), dayjs().toISOString()]
    case 'last-4-hours':
      return [dayjs().subtract(4, 'hour').toISOString(), dayjs().toISOString()]
  }
  return [undefined, undefined]
}

export function useTimePeriod() {
  const [timePeriod, setTimePeriodInt] = useState(Store.ui.results.filter.timePeriod)
  const [start, end] = getTimePeriodRange(timePeriod.value)

  const [startDate, setStartDate] = useState(start)
  const [endDate, setEndDate] = useState(end)

  const setTimePeriod = (period: TimePeriod) => {
    const newTimePeriod = TimePeriods.find((p) => p.value === period.value)
    if (newTimePeriod) {
      setTimePeriodInt(newTimePeriod)
      const [newStart, newEnd] = getTimePeriodRange(period.value)
      setStartDate(newStart)
      setEndDate(newEnd)
      Store.ui.results.filter.timePeriod = newTimePeriod
    }
  }

  return { startDate, endDate, timePeriod, setTimePeriod }
}
