import { ChakraProvider } from '@chakra-ui/react'
import { Home } from './Home'
import './App.css'
import 'focus-visible/dist/focus-visible'

import { Routes, Route, Navigate } from 'react-router-dom'

import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import { SignIn } from './components/SignIn'
import SignUp from './components/SignUp'
import ForgotPassword from './components/ForgotPassword'
import Console from './Console'
import NewEnv from './components/NewEnv'
import { MonitorDashboard } from './components/MonitorDashboard'
import { MonitorView } from './components/MonitorView'
import { MonitorEditPanel } from './components/MonitorEditPanel'
import { Store } from './services/Store'
import { ReactNode } from 'react'

const history = createBrowserHistory()
Store.history = history //save for later

const ProtectedRoute = ({ isAllowed, children }: { isAllowed: boolean; children: JSX.Element }) => {
  if (!isAllowed) {
    return <Navigate to={'/console/signin'} replace />
  }

  return children
}

function App() {
  const user = Store.watch(Store.UserState).user

  return (
    <HistoryRouter history={history}>
      <ChakraProvider>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/console' element={<Console />}>
            <Route
              path='/console/monitors'
              element={
                <ProtectedRoute isAllowed={!!user}>
                  <MonitorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/console/monitors/:id'
              element={
                <ProtectedRoute isAllowed={!!user}>
                  <MonitorView />
                </ProtectedRoute>
              }
            />
            <Route
              path='/console/monitors/:id/edit'
              element={
                <ProtectedRoute isAllowed={!!user}>
                  <MonitorEditPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path='/console/monitors/newapi'
              element={
                <ProtectedRoute isAllowed={!!user}>
                  <MonitorEditPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path='/console/env/new'
              element={
                <ProtectedRoute isAllowed={!!user}>
                  <NewEnv />
                </ProtectedRoute>
              }
            />
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
