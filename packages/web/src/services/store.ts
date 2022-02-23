import { User } from 'firebase/auth'
import { proxy, useSnapshot } from 'valtio'
import { devtools } from 'valtio/utils'

interface UserState {
  user?: User
  isLoggedIn: boolean
}

const userState: UserState = { isLoggedIn: false }
const store = {
  user: proxy(userState),
}

const operator = {
  ...store,
  watch: useSnapshot,
}

if (process.env.NODE_ENV === 'development') devtools(proxy(store), 'store')

export default operator
