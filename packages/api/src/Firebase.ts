import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import admin from 'firebase-admin'

const serviceAccount = require('../../../serviceAccountKey.json')

export const firebaseApp = initializeApp({
  projectId: 'httpmon-test',
  credential: admin.credential.cert(serviceAccount),
})

export const firebaseAuth = getAuth(firebaseApp)
