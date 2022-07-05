import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

export const firebaseApp = initializeApp({
  projectId: 'httpmon-test',
  credential: applicationDefault(),
})

export const firebaseAuth = getAuth(firebaseApp)
