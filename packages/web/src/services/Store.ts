import { TimePeriods } from './MonitorTimePeriod'
import { MonitorLocations } from './MonitorLocations'
import { User } from 'firebase/auth'
import { proxy, snapshot, subscribe, useSnapshot } from 'valtio'
import { BrowserHistory } from 'history'
import { QueryClient } from 'react-query'
import { UIState, UserAccount } from '@httpmon/db'
import axios from 'axios'

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
  teams: UserAccount[]
  bLoadingUserFirstTime: boolean
}

interface StoreState {
  UserState: UserState
  UIState: UIState
  history: BrowserHistory | null
  queryClient: QueryClient | null
  user: User | null
}

const defaultUserState: UserState = { userInfo: {}, bLoadingUserFirstTime: false, teams: [] }
const defaultUiState: UIState = {
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

const uiState = proxy(defaultUiState)
const userState = proxy(defaultUserState)

const store: StoreState = {
  UserState: userState,
  UIState: uiState,
  history: null,
  queryClient: null,
  user: null,
}

export const Store = {
  ...store,
  watch: useSnapshot,
}

subscribe(uiState, () => {
  axios({
    method: 'PUT',
    url: `/settings/ui-state`,
    data: {
      uiState: snapshot(uiState),
    },
  })
})

subscribe(userState.userInfo, () => {
  if (
    userState.userInfo.accountId &&
    axios.defaults.headers.common['x-proautoma-accountid'] != userState.userInfo.accountId
  )
    axios.defaults.headers.common['x-proautoma-accountid'] = userState.userInfo.accountId
})
