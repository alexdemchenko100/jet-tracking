import { User } from 'firebase/auth'
import { proxy, useSnapshot } from 'valtio'
import { devtools } from 'valtio/utils'

interface UserState {
  user?: User
  isLoggedIn: boolean
}

interface UItate {
  APIResultTabIndex: number
}

const userState: UserState = { isLoggedIn: false }
const uiState: UItate = { APIResultTabIndex: 1 }
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
