import { ChakraProvider, Box } from '@chakra-ui/react'
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
import VerifyUser from './Pages/VerifyUser'
import { EnvEditor } from './Pages/EnvEditor'
import { theme } from './services/ChakraTheme'
import {
  SettingsProfile,
  SettingsNotifications,
  SettingsSecurity,
  EnvMain,
  SettingsUsers,
  SettingsBilling,
  SettingsBillingPlans,
  SettingsApiKeys,
} from './components'
import StatusPages from './Pages/StatusPages'
import NewStatusPage from './Pages/NewStatusPage'
import EditStatusPage from './Pages/EditStatusPage'
import ActivityLogs from './Pages/ActivityLogs'
import SettingsBillingPayAsYouGo from './components/SettingsBillingPayAsYouGo'
import SettingsBillingPrepaid from './components/SettingsBillingPrepaid'

const history = createBrowserHistory()
Store.history = history //save for later

const ProtectedRoute = ({ isAllowed, children }: { isAllowed: boolean; children: JSX.Element }) => {
  const { bLoadingUserFirstTime } = Store.watch(Store.UserState)
  const location = useLocation()

  if (!bLoadingUserFirstTime) {
    //wait for it
    return (
      <Box py='10' textAlign='center'>
        Loading...
      </Box>
    )
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
              path='/console/settings'
              element={
                <ProtectedRoute isAllowed={isLoggedIn}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            >
              <Route
                path='/console/settings'
                element={
                  <ProtectedRoute isAllowed={isLoggedIn}>
                    <Navigate to='/console/settings/profile' replace />
                  </ProtectedRoute>
                }
              />
              <Route path='/console/settings/profile' element={<SettingsProfile />} />
              <Route path='/console/settings/security' element={<SettingsSecurity />} />
              <Route path='/console/settings/notifications' element={<SettingsNotifications />} />
              <Route path='/console/settings/api-keys' element={<SettingsApiKeys />} />
              <Route path='/console/settings/users' element={<SettingsUsers />} />
              <Route path='/console/settings/billing' element={<SettingsBilling />} />
              <Route path='/console/settings/billing/plans' element={<SettingsBillingPlans />} />
              <Route
                path='/console/settings/billing/pay-as-you-go'
                element={<SettingsBillingPayAsYouGo />}
              />
              <Route
                path='/console/settings/billing/prepaid'
                element={<SettingsBillingPrepaid />}
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
            <Route
              path='/console/status-pages'
              element={
                <ProtectedRoute isAllowed={isLoggedIn}>
                  <StatusPages />
                </ProtectedRoute>
              }
            />
            <Route
              path='/console/status-pages/new'
              element={
                <ProtectedRoute isAllowed={isLoggedIn}>
                  <NewStatusPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/console/status-pages/:id'
              element={
                <ProtectedRoute isAllowed={isLoggedIn}>
                  <EditStatusPage />
                </ProtectedRoute>
              }
            />
            //unprotected for ondemand clients
            <Route path='/console/monitors/ondemand' element={<MonitorEditPanel />} />
            <Route
              path='/console/activity'
              element={
                <ProtectedRoute isAllowed={isLoggedIn}>
                  <ActivityLogs />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path='/console/signin' element={<SignIn />} />
          <Route path='/console/signup' element={<SignUp />} />
          <Route path='/console/forgot' element={<ForgotPassword />} />
          <Route path='/console/emails/verify' element={<VerifyEmail />} />
          <Route path='/console/users/verify' element={<VerifyUser />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </ChakraProvider>
    </HistoryRouter>
  )
}

export default App
