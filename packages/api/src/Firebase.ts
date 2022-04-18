import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

export const firebaseApp = initializeApp({
  projectId: 'phoenix-mqtt-platform',
  credential: applicationDefault(),
})

export const firebaseAuth = getAuth(firebaseApp)
