import { TimePeriods } from './MonitorTimePeriod'
import { MonitorLocation, MonitorLocations } from './MonitorLocations'
import { User } from 'firebase/auth'
import { proxy, useSnapshot } from 'valtio'
import { devtools } from 'valtio/utils'
import { BrowserHistory } from 'history'
import { QueryClient } from 'react-query'

interface UserState {
  user: User | null
}

interface StoreState {
  UserState: UserState
  UIState: UIState
  history: BrowserHistory | null
  queryClient: QueryClient | null
}

interface UIState {
  editor: {
    monitorLocations: MonitorLocation[]
    frequencyScale: number
  }
  results: {
    tabIndex: number
    filter: {
      timePeriod: { label: string; value: string }
      status: string
      locations: string[]
    }
  }
}

const userState: UserState = { user: null }
const uiState: UIState = {
  editor: {
    monitorLocations: [...MonitorLocations],
    frequencyScale: 0,
  },
  results: {
    tabIndex: 0,
    filter: { timePeriod: TimePeriods[0], status: '', locations: [] },
  },
}
const store: StoreState = {
  UserState: proxy(userState),
  UIState: proxy(uiState),
  history: null,
  queryClient: null,
}

export const Store = {
  ...store,
  watch: useSnapshot,
}

if (process.env.NODE_ENV != 'development') devtools(proxy(store), 'store')
