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
    Store.UserState = { user }

    if (user) {
      user.getIdToken().then((token) => {
        axios.defaults.headers.common = {
          ...axios.defaults.headers.common,
          Authorization: `Bearer ${token}`,
        }
      })
    } else {
      if (axios.defaults.headers.common.Authorization) {
        delete axios.defaults.headers.common.Authorization
      }
    }
  })

  // Add a response interceptor
  axios.interceptors.response.use(undefined, async (error: AxiosError) => {
    if (error.response && error.response.status == 401) {
      console.log('unauthorized')
      Store.History.push('/console/signin?err=401')
    }
  })
}

export async function signOut() {
  if (auth) {
    await auth.signOut()
  }
  Store.UserState = { user: null }
  Store.QueryClient.removeQueries()
}

export function isLoggedIn() {
  return !!Store.UserState.user
}
