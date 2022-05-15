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

let auth: Auth | null = null

export function initFirebaseAuth() {
  const firebaseConfig = {
    apiKey: 'AIzaSyAqn0-0Bq3yUQaoVm3Yf-XU8dSN3nNUa9g',
    authDomain: 'httpmon-test.firebaseapp.com',
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

export function setUser(user: User | null) {
  if (user) {
    const { uid, email, displayName, photoURL } = user
    Store.UserState.userInfo.uid = uid
    Store.UserState.userInfo.email = email || undefined
    Store.UserState.userInfo.displayName = displayName || undefined
    Store.UserState.userInfo.photoURL = photoURL || undefined
    Store.user = user
  }

  getIDTokenPossiblyRefreshed()
}

export function useAuth() {
  const userState = Store.watch(Store.UserState)

  return {
    isLoggedIn: isLoggedIn(),
    signOut: signOut,
    userInfo: userState.userInfo,
  }
}
