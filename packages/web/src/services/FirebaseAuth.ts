/*
 *  Copyright (c) 2020. ProAutoma LLC - All Rights Reserved
 *  Unauthorized copying of this file, via any medium is strictly prohibited
 *  Proprietary and confidential
 *
 */

import axios, { AxiosError } from 'axios'
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth, Auth, User } from 'firebase/auth'
import { Store } from './Store'
import { UserAccount } from '@httpmon/db'

let auth: Auth | null = null

export function initFirebaseAuth() {
  const firebaseConfig = {
    apiKey: 'AIzaSyAqn0-0Bq3yUQaoVm3Yf-XU8dSN3nNUa9g',
    authDomain: 'www.proautoma.com',
    projectId: 'httpmon-test',
    storageBucket: 'httpmon-test.appspot.com',
    messagingSenderId: '439355076640',
    appId: '1:439355076640:web:3754458b85e17b34120c45',
    measurementId: 'G-MGHY3X5DJN',
  }

  const app = initializeApp(firebaseConfig)
  const analytics = getAnalytics(app)
  auth = getAuth(app)

  auth.onIdTokenChanged((user: User | null) => {
    //On init, this flag is false and here set to true
    //and it always stays true until the user logs out
    //used to prevent the login redirects on force reload
    Store.UserState.bLoadingUserFirstTime = true
    setUser(user)
  })

  // Add a response interceptor
  axios.interceptors.response.use(undefined, async (error: AxiosError) => {
    if (error.response && error.response.status == 401) {
      console.log('unauthorized - get token again possibly')
      await getIDTokenPossiblyRefreshed()
      if (!getAuth().currentUser) {
        Store.history?.push('/console/signin')
      }
    } else {
      //let the error be handled by the caller
      return Promise.reject(error)
    }
  })
}

async function getIDTokenPossiblyRefreshed(user: User | null = null) {
  if (!user) {
    const auth = getAuth()
    user = auth.currentUser
  }

  if (!user) {
    if (axios.defaults.headers.common.Authorization) {
      delete axios.defaults.headers.common.Authorization
    }
    return
  }

  const token = await user.getIdToken()
  axios.defaults.headers.common = {
    ...axios.defaults.headers.common,
    Authorization: `Bearer ${token}`,
  }
}

export async function signOut() {
  if (auth) {
    await auth.signOut()
  }
  Store.UserState.userInfo = {}
  if (Store.queryClient) {
    Store.queryClient.removeQueries()
  }
}

export function isLoggedIn(): boolean {
  //if email is not set, then user is not logged in
  if (
    Store.UserState.userInfo.email &&
    Store.UserState.userInfo.email.length > 0 &&
    Store.user?.emailVerified
  ) {
    return true
  }
  return false
}

export async function setCurrentAccount(account: UserAccount) {
  //let the server know
  await axios.post('/settings/accounts/default', {
    email: account.email,
    accountId: account.accountId,
  })

  Store.UserState.userInfo.role = account.role
  Store.UserState.userInfo.accountId = account.accountId
  axios.defaults.headers.common['x-proautoma-accountid'] = account.accountId

  //console.log('switch to ', account)

  await getDefaultRoleAndAccount(account.email)
}

async function getDefaultRoleAndAccount(email: string) {
  const resp = await axios({
    method: 'GET',
    url: `/settings/accounts`,
  })

  const defaultAccount = resp.data.find((item: UserAccount) => item.isCurrentAccount) as UserAccount

  if (!Store.UserState.userInfo.role) {
    Store.UserState.userInfo.role = defaultAccount?.role
    Store.UserState.userInfo.accountId = defaultAccount?.accountId
  }

  //Store team info in the Store
  Store.UserState.teams = resp.data as UserAccount[]

  // UIState settings
  const { data } = await axios({
    method: 'GET',
    url: `/settings/ui-state`,
  })
  if (data.uiState) {
    Store.UIState.monitors.isGridView = data.uiState?.monitors?.isGridView
    Store.UIState.editor.frequencyScale = data.uiState?.editor?.frequencyScale
    Store.UIState.editor.monitorLocations = data.uiState?.editor?.monitorLocations
    Store.UIState.results.tabIndex = data.uiState?.results?.tabIndex
    Store.UIState.results.filter.timePeriod = data.uiState?.results?.filter?.timePeriod
    Store.UIState.results.filter.status = data.uiState?.results?.filter?.status
    Store.UIState.results.filter.locations = data.uiState?.results?.filter?.locations
  }
}

export function setUser(user: User | null, role?: string, accountId?: string) {
  console.log('set user', user, role, accountId)

  if (user) {
    const { uid, email, displayName, photoURL, phoneNumber } = user
    Store.UserState.userInfo.uid = uid
    Store.UserState.userInfo.email = email || undefined
    Store.UserState.userInfo.displayName = displayName || undefined
    Store.UserState.userInfo.photoURL = photoURL || undefined
    Store.UserState.userInfo.phoneNumber = phoneNumber
    Store.user = user
  }

  if (role) {
    Store.UserState.userInfo.role = role
  }

  if (accountId) {
    Store.UserState.userInfo.accountId = accountId
    axios.defaults.headers.common['x-proautoma-accountid'] = accountId
  }

  getIDTokenPossiblyRefreshed().then(() => {
    //get team data here after setting the bearer token
    if (user && user.email && !Store.UserState.userInfo.role) getDefaultRoleAndAccount(user.email)
  })
}

export function useAuth() {
  const userState = Store.watch(Store.UserState)

  return {
    isLoggedIn: isLoggedIn(),
    signOut: signOut,
    userInfo: userState.userInfo,
    teams: userState.teams,
  }
}
