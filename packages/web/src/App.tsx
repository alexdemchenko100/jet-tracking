import { ChakraProvider } from '@chakra-ui/react'
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
import { SettingsPage } from './Pages/Settings'
import { Environments } from './Pages/Environments'
import NotFound from './Pages/NotFound'
import VerifyEmail from './Pages/VerifyEmail'
import { EnvEditor } from './Pages/EnvEditor'
import { theme } from './services/ChakraTheme'
import {
  SettingsProfile,
  SettingsNotifications,
  SettingsSecurity,
  EnvMain,
  SettingsUsers,
} from './components'
import StatusPages from './Pages/StatusPages'
import NewStatusPage from './Pages/NewStatusPage'
import EditStatusPage from './Pages/EditStatusPage'
import ActivityLogs from './Pages/ActivityLogs'

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
      <ChakraProvider theme={theme}>
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
            <Route path='/console/settings' element={<SettingsPage />}>
              <Route
                path='/console/settings'
                element={
                  <ProtectedRoute isAllowed={isLoggedIn}>
                    <Navigate to='/console/settings/profile' replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/console/settings/profile'
                element={
                  <ProtectedRoute isAllowed={isLoggedIn}>
                    <SettingsProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/console/settings/security'
                element={
                  <ProtectedRoute isAllowed={isLoggedIn}>
                    <SettingsSecurity />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/console/settings/notifications'
                element={
                  <ProtectedRoute isAllowed={isLoggedIn}>
                    <SettingsNotifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/console/settings/users'
                element={
                  <ProtectedRoute isAllowed={isLoggedIn}>
                    <SettingsUsers />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route
              path='/console/envs'
              element={
                <ProtectedRoute isAllowed={isLoggedIn}>
                  <Environments />
                </ProtectedRoute>
              }
            >
              <Route path='/console/envs' element={<EnvMain />} />
              <Route path='/console/envs/:id' element={<EnvEditor />} />
              <Route path='/console/envs/new' element={<NewEnv />} />
            </Route>
            <Route path='/console/status-pages' element={<StatusPages />} />
            <Route path='/console/status-pages/new' element={<NewStatusPage />} />
            <Route path='/console/status-pages/:id' element={<EditStatusPage />} />
            //unprotected for ondemand clients
            <Route path='/console/monitors/ondemand' element={<MonitorEditPanel />} />
            <Route path='/console/activity' element={<ActivityLogs />} />
          </Route>

          <Route path='/console/signin' element={<SignIn />} />
          <Route path='/console/signup' element={<SignUp />} />
          <Route path='/console/forgot' element={<ForgotPassword />} />
          <Route path='/console/emails/verify' element={<VerifyEmail />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </ChakraProvider>
    </HistoryRouter>
  )
}

export default App
