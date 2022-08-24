import { TimePeriods } from './MonitorTimePeriod'
import { MonitorLocation, MonitorLocations } from './MonitorLocations'
import { User } from 'firebase/auth'
import { proxy, useSnapshot } from 'valtio'
import { devtools } from 'valtio/utils'
import { BrowserHistory } from 'history'
import { QueryClient } from 'react-query'

interface UserInfo {
  uid?: string
  email?: string
  displayName?: string
  photoURL?: string
  phoneNumber?: string | null
  role?: string
  accountId?: string
}

interface UserState {
  userInfo: UserInfo
  bLoadingUserFirstTime: boolean
}

interface StoreState {
  UserState: UserState
  UIState: UIState
  history: BrowserHistory | null
  queryClient: QueryClient | null
  user: User | null
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
  monitors: {
    isGridView: boolean
  }
}

const userState: UserState = { userInfo: {}, bLoadingUserFirstTime: false }
const uiState: UIState = {
  editor: {
    monitorLocations: [...MonitorLocations],
    frequencyScale: 0,
  },
  results: {
    tabIndex: 0,
    filter: { timePeriod: TimePeriods[0], status: '', locations: [] },
  },
  monitors: {
    isGridView: false,
  },
}
const store: StoreState = {
  UserState: proxy(userState),
  UIState: proxy(uiState),
  history: null,
  queryClient: null,
  user: null,
}

export const Store = {
  ...store,
  watch: useSnapshot,
}
