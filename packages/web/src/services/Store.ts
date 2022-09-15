import { TimePeriods } from './MonitorTimePeriod'
import { MonitorLocations } from './MonitorLocations'
import { User } from 'firebase/auth'
import { proxy, snapshot, subscribe, useSnapshot } from 'valtio'
import { subscribeKey } from 'valtio/utils'
import { BrowserHistory } from 'history'
import { QueryClient } from 'react-query'
import { UIState, UserAccount } from '@httpmon/db'
import axios from 'axios'
import clone from 'lodash.clonedeep'
interface UserInfo {
  uid: string
  email: string
  displayName: string
  photoURL: string
  phoneNumber: string
  role: string
  accountId: string
  provider: string
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

const defaultUserState: UserState = {
  userInfo: {
    accountId: '',
    role: '',
    uid: '',
    email: '',
    displayName: '',
    provider: '',
    phoneNumber: '',
    photoURL: '',
  },
  bLoadingUserFirstTime: false,
  teams: [],
}
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
  if (userState.userInfo.uid)
    axios({
      method: 'PUT',
      url: `/settings/ui-state`,
      data: {
        uiState: snapshot(uiState),
      },
    })
})

subscribe(userState, () => {
  console.log('reset accountId', Store.UserState.userInfo.accountId)
  if (userState.userInfo.accountId)
    axios.defaults.headers.common['x-proautoma-accountid'] = userState.userInfo.accountId
  else delete axios.defaults.headers.common['x-proautoma-accountid']
})

export function clearUserInfo() {
  Store.UserState.userInfo = clone(defaultUserState.userInfo)
  Store.UserState.teams = []
}

export function clearStore() {
  clearUserInfo()
  Store.UIState.editor = defaultUiState.editor
  Store.UIState.monitors = defaultUiState.monitors
  Store.UIState.results = defaultUiState.results
  Store.user = null

  console.log('clear store', snapshot(Store.UserState))
}
