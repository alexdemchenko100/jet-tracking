import { ChakraProvider } from '@chakra-ui/react'
import { Home } from './Home'
import './App.css'
import 'focus-visible/dist/focus-visible'

import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import { SignIn } from './Pages/SignIn'
import SignUp from './Pages/SignUp'
import ForgotPassword from './components/ForgotPassword'
import Console from './Console'
import NewEnv from './components/NewEnv'
import { MonitorDashboard } from './components/MonitorDashboard'
import { MonitorView } from './components/MonitorView'
import { MonitorEditPanel } from './components/MonitorEditPanel'
import { useAuth } from './services/FirebaseAuth'
import { Store } from './services/Store'
import MainPage from './Pages/MainPage'
import { APIResultById } from './components/APIResultById'
import { Settings } from './Pages/Settings'
import { Dashboards } from './Pages/Dashboards'
import { Environments } from './Pages/Environments'
import NotFound from './Pages/NotFound'

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
          <Route
            path='/'
            element={
              isLoggedIn ? (
                <Navigate to='/console/monitors' replace />
              ) : (
                <Navigate to='/console/signin' />
              )
            }
          />
          <Route path='/console' element={<Console />}>
            <Route
              path='/console/monitors'
              element={
                <ProtectedRoute isAllowed={isLoggedIn}>
                  <MainPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/console/monitors2'
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
              path='/console/apiruns/:id'
              element={
                <ProtectedRoute isAllowed={isLoggedIn}>
                  <APIResultById />
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
            <Route
              path='/console/settings'
              element={
                <ProtectedRoute isAllowed={isLoggedIn}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path='/console/dashboards'
              element={
                <ProtectedRoute isAllowed={isLoggedIn}>
                  <Dashboards />
                </ProtectedRoute>
              }
            />
            <Route
              path='/console/environments'
              element={
                <ProtectedRoute isAllowed={isLoggedIn}>
                  <Environments />
                </ProtectedRoute>
              }
            />
            //unprotected for ondemand clients
            <Route path='/console/monitors/ondemand' element={<MonitorEditPanel />} />
          </Route>

          <Route path='/console/signin' element={<SignIn />} />
          <Route path='/console/signup' element={<SignUp />} />
          <Route path='/console/forgot' element={<ForgotPassword />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </ChakraProvider>
    </HistoryRouter>
  )
}

export default App
