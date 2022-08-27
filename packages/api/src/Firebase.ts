import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import admin from 'firebase-admin'

export const firebaseApp = initializeApp({
  credential:
    process.env.NODE_ENV == 'production'
      ? applicationDefault()
      : admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        } as admin.ServiceAccount),
})

export const firebaseAuth = getAuth(firebaseApp)
