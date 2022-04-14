import { MonitorLocation, MonitorLocations } from './MonitorLocations'
import { User } from 'firebase/auth'
import { proxy, useSnapshot } from 'valtio'
import { devtools } from 'valtio/utils'

interface UserState {
  user?: User
  isLoggedIn: boolean
}

interface UIState {
  APIResultTabIndex: number
  editor: {
    monitorLocations: MonitorLocation[]
    frequencyScale: number
  }
}

const userState: UserState = { isLoggedIn: false }
const uiState: UIState = {
  APIResultTabIndex: 1,
  editor: { monitorLocations: [...MonitorLocations], frequencyScale: 0 },
}
const store = {
  user: proxy(userState),
  ui: proxy(uiState),
}

export const Store = {
  ...store,
  watch: useSnapshot,
}

if (process.env.NODE_ENV === 'development') devtools(proxy(store), 'store')

export default Store
