import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { QueryClient, QueryClientProvider } from 'react-query'
import firebaseService from './FirebaseService'
import axios from 'axios'
firebaseService.isLoggedIn()

//axios.defaults.withCredentials = true
axios.defaults.maxRedirects = 0
axios.defaults.headers.common = { 'X-Requested-With': 'XMLHttpRequest' }
if (process.env.NODE_ENV === 'production') {
  axios.defaults.baseURL = 'https://api.promqtt.com'
} else {
  axios.defaults.baseURL = 'http://localhost:3006'
}

ReactDOM.render(
  <QueryClientProvider client={new QueryClient()}>
    <App />
  </QueryClientProvider>,
  document.getElementById('root')
)
