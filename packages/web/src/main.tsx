import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { QueryClient, QueryClientProvider } from 'react-query'
import firebaseService from './FirebaseService'
firebaseService.isLoggedIn()

ReactDOM.render(
  <QueryClientProvider client={new QueryClient()}>
    <App />
  </QueryClientProvider>,
  document.getElementById('root')
)
