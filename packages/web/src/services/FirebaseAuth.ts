/*
 *  Copyright (c) 2020. ProAutoma LLC - All Rights Reserved
 *  Unauthorized copying of this file, via any medium is strictly prohibited
 *  Proprietary and confidential
 *
 */

import axios, { AxiosError } from 'axios'
import { initializeApp } from 'firebase/app'
import { getAuth, Auth, User } from 'firebase/auth'
import { Store } from './Store'

let auth: Auth | null = null

export function initFirebaseAuth() {
  const configOptions = {
    apiKey: 'AIzaSyD0PU6XG2RMp2sPw6qZsSgx-My_i9t0djM',
    authDomain: 'phoenix-mqtt-platform.firebaseapp.com',
    databaseURL: 'https://phoenix-mqtt-platform.firebaseio.com',
    projectId: 'phoenix-mqtt-platform',
    storageBucket: 'phoenix-mqtt-platform.appspot.com',
    messagingSenderId: '162202601276',
    appId: '1:162202601276:web:a1e75b367c88b085700039',
    measurementId: 'G-HFKL2R0EEY',
  }

  const app = initializeApp(configOptions)
  auth = getAuth(app)

  auth.onIdTokenChanged((user: User | null) => {
    // console.log('onIdTokenChanged', user)
    setUser(user)
  })

  // Add a response interceptor
  axios.interceptors.response.use(undefined, async (error: AxiosError) => {
    if (error.response && error.response.status == 401) {
      console.log('unauthorized - get token again possibly')
      await getIDTokenPossiblyRefreshed()
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
