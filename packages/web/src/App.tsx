import { ChakraProvider } from '@chakra-ui/react'
import { Home } from './Home'
import './App.css'
import 'focus-visible/dist/focus-visible'

import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

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
import { useAuth } from './services/FirebaseAuth'
import { Store } from './services/Store'

const history = createBrowserHistory()
Store.history = history //save for later

const ProtectedRoute = ({ isAllowed, children }: { isAllowed: boolean; children: JSX.Element }) => {
  const { bLoadingUserFirstTime } = Store.watch(Store.UserState)
  const location = useLocation()

  if (!bLoadingUserFirstTime) {
    //wait for it
    return <div>Loading...</div>
  }

  if (!isAllowed) {
    return <Navigate to={'/console/signin'} state={{ from: location }} replace />
  }

  return children
}

function App() {
  const { isLoggedIn } = useAuth()

  return (
    <HistoryRouter history={history}>
      <ChakraProvider>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/console' element={<Console />}>
            <Route
              path='/console/monitors'
              element={
                <ProtectedRoute isAllowed={isLoggedIn}>
                  <MonitorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/console/monitors/:id'
              element={
                <ProtectedRoute isAllowed={isLoggedIn}>
                  <MonitorView />
                </ProtectedRoute>
              }
            />
            <Route
              path='/console/monitors/:id/edit'
              element={
                <ProtectedRoute isAllowed={isLoggedIn}>
                  <MonitorEditPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path='/console/monitors/newapi'
              element={
                <ProtectedRoute isAllowed={isLoggedIn}>
                  <MonitorEditPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path='/console/env/new'
              element={
                <ProtectedRoute isAllowed={isLoggedIn}>
                  <NewEnv />
                </ProtectedRoute>
              }
            />
            //unprotected for ondemand clients
            <Route path='/console/monitors/ondemand' element={<MonitorEditPanel />} />
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
