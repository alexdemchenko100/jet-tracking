import { ChakraProvider } from '@chakra-ui/react'
import { Home } from './Home'
import './App.css'

import { Routes, Route } from 'react-router-dom'

import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import { SignIn } from './components/SignIn'
import SignUp from './components/SignUp'
import ForgotPassword from './components/ForgotPassword'
import Console from './Console'
import { MonitorEditor } from './components/MonitorEditor'
import NewEnv from './components/NewEnv'
import { MonitorDashboard } from './components/MonitorDashboard'
import MonitorResultTable from './components/MonitorResultTable'
import { MonitorView } from './components/MonitorView'
const history = createBrowserHistory()

function App() {
  return (
    <HistoryRouter history={history}>
      <ChakraProvider>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/console' element={<Console />}>
            <Route path='/console/monitors' element={<MonitorDashboard />} />
            <Route path='/console/monitors/:id' element={<MonitorView />} />
            <Route path='/console/monitors/:id/edit' element={<MonitorEditor />} />
            <Route path='/console/monitors/newapi' element={<MonitorEditor />} />
            <Route path='/console/env/new' element={<NewEnv />} />
          </Route>

          <Route path='/console/signin' element={<SignIn />} />
          <Route path='/console/signup' element={<SignUp />} />
          <Route path='/console/forgot' element={<ForgotPassword />} />
        </Routes>
      </ChakraProvider>
    </HistoryRouter>
  )
}

export default App
