import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { QueryClient, QueryClientProvider } from 'react-query'
import axios from 'axios'
import { initFirebaseAuth } from './services/FirebaseAuth'
import { Store } from './services/Store'

//get firebase auth setup
initFirebaseAuth()

//with credentials requires server response with a concrete origin,
//wildcard origin is not allowed
axios.defaults.withCredentials = true
axios.defaults.maxRedirects = 0
if (process.env.NODE_ENV === 'production') {
  axios.defaults.baseURL = '/api'
} else {
  axios.defaults.baseURL = 'http://localhost:8080/api'
}

ReactDOM.render(
  <QueryClientProvider client={Store.QueryClient}>
    <App />
  </QueryClientProvider>,
  document.getElementById('root')
)
