/*
 *  Copyright (c) 2020. ProAutoma LLC - All Rights Reserved
 *  Unauthorized copying of this file, via any medium is strictly prohibited
 *  Proprietary and confidential
 *
 */

import axios, { AxiosError } from 'axios'
import { FirebaseApp, initializeApp } from 'firebase/app'
import { getAuth, Auth, User } from 'firebase/auth'
import { createBrowserHistory } from 'history'

//imports auth module into firebase app object as side effect
//otw, app.auth() return null

class FirebaseService {
  public app: FirebaseApp
  public auth: Auth
  authInit = false
  token = ''

  constructor() {
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

    this.app = initializeApp(configOptions)
    this.auth = getAuth(this.app)

    this.auth.onAuthStateChanged((user: User | null) => {
      // console.log("onAuthStateChanged: " + (user ? user.email : ""))
      if (user && user.emailVerified) {
        user.getIdToken().then((token) => {
          this.token = token
          axios.defaults.headers.common = { Authorization: `Bearer ${token}` }
        })
      } else {
        axios.defaults.headers.common = {}
      }
    })

    // Add a response interceptor
    axios.interceptors.response.use(undefined, async (error: AxiosError) => {
      if (error.response && error.response.status == 401) {
        try {
          let user = this.auth.currentUser
          if (user && user.emailVerified) {
            const token = await user.getIdToken()
            if (token != this.token) {
              // console.log("token refreshed")
              this.token = token
              error.config.headers &&
                (error.config.headers['Authorization'] = `Bearer ${token}`)
              axios.defaults.headers.common = {
                Authorization: `Bearer ${token}`,
              }
              return axios.request(error.config)
            }
          }
        } catch (e) {}
      }

      // const route = router.currentRoute
      const history = createBrowserHistory()

      if (
        history.location.pathname != '/console/signin' &&
        error.response &&
        error.response.status == 401
      ) {
        history.push('/console/signin?err=401')
      }

      return Promise.reject(error)
    })
  }

  isLoggedIn(): User | null {
    let user = this.auth.currentUser
    if (user && user.emailVerified) {
      return user
    }
    return null
  }

  getCurrentUserAsync() {
    return new Promise((resolve, reject) => {
      if (this.authInit) resolve(this.auth.currentUser)

      const unsubscribe = this.auth.onAuthStateChanged((user) => {
        unsubscribe()
        this.authInit = true
        resolve(user)
      }, reject)
    })
  }
}

const firebaseService = new FirebaseService()
export default firebaseService
