import { ChakraProvider, Container } from '@chakra-ui/react'
import RealTimeMonitor from './RealTimeMonitor'
import { Home } from './Home'
import './App.css'

import { Routes, Route } from 'react-router-dom'

import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import { Signin } from './components/SignIn'
const history = createBrowserHistory()

function App() {
  return (
    <HistoryRouter history={history}>
      <ChakraProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/console/signin" element={<Signin />} />
          <Route path="/try" element={<RealTimeMonitor />} />
        </Routes>
      </ChakraProvider>
    </HistoryRouter>
  )
}

export default App
