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
import { useQuery } from 'react-query'

let auth: Auth | null = null

const projectId = import.meta.env.VITE_PROJECT_ID

export function initFirebaseAuth() {
  let firebaseConfig
  if (projectId == 'proautoma-prod') {
    firebaseConfig = {
      apiKey: 'AIzaSyDVcw-3mJw9ThX59jUioLgbtLfSLMwOtls',
      authDomain: 'proautoma-prod.firebaseapp.com',
      projectId: 'proautoma-prod',
      storageBucket: 'proautoma-prod.appspot.com',
      messagingSenderId: '1022938529635',
      appId: '1:1022938529635:web:c5418e535470a2ae089d56',
      measurementId: 'G-15CN29YYYZ',
    }
  } else if (projectId == 'httpmon-stage') {
    firebaseConfig = {
      apiKey: 'AIzaSyCnCXQ23mj2_VI2r70k2Zpmb8J5g4JC_wA',
      authDomain: 'httpmon-stage.firebaseapp.com',
      projectId: 'httpmon-stage',
      storageBucket: 'httpmon-stage.appspot.com',
      messagingSenderId: '818508123940',
      appId: '1:818508123940:web:51c3e74d248b65c31fadb1',
    }
  } else {
    firebaseConfig = {
      apiKey: 'AIzaSyAqn0-0Bq3yUQaoVm3Yf-XU8dSN3nNUa9g',
      authDomain: 'www.proautoma.com',
      projectId: 'httpmon-test',
      storageBucket: 'httpmon-test.appspot.com',
      messagingSenderId: '439355076640',
      appId: '1:439355076640:web:3754458b85e17b34120c45',
      measurementId: 'G-MGHY3X5DJN',
    }
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
}

async function getPrimaryAccount() {
  const resp = await axios({
    method: 'GET',
    url: `/settings/accounts`,
  })

  const primaryAccount = resp.data.find((item: UserAccount) => item.isPrimary) as UserAccount

  if (!Store.UserState.userInfo.role) {
    Store.UserState.userInfo.role = primaryAccount?.role
    Store.UserState.userInfo.accountId = primaryAccount?.accountId
  }

  //Store team info in the Store
  Store.UserState.teams = resp.data as UserAccount[]
}

export function setUser(user: User | null, role?: string, accountId?: string) {
  //console.log('set user', user, role, accountId)

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
  }

  getIDTokenPossiblyRefreshed().then(() => {
    //get team data here after setting the bearer token
    if (user && user.email && !Store.UserState.userInfo.role) getPrimaryAccount()
  })
}

export function useAuth() {
  const userState = Store.watch(Store.UserState)

  useQuery(
    'ui-state',
    async () => {
      const { data } = await axios({
        method: 'GET',
        url: `/settings/ui-state`,
      })
      if (data.uiState) {
        Store.UIState.monitors = { ...Store.UIState.monitors, ...data.uiState.monitors }
        Store.UIState.editor = { ...Store.UIState.editor, ...data.uiState.editor }
        Store.UIState.results = { ...Store.UIState.results, ...data.uiState.results }
      }
    },
    {
      staleTime: 5 * 60 * 1000,
    }
  )

  return {
    isLoggedIn: isLoggedIn(),
    signOut: signOut,
    userInfo: userState.userInfo,
    teams: userState.teams,
  }
}
