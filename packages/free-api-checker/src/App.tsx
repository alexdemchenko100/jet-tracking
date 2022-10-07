import { ChakraProvider } from '@chakra-ui/react'
import './App.css'
import 'focus-visible/dist/focus-visible'

import { Routes, Route } from 'react-router-dom'

import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import { MonitorEditPanel } from './components/MonitorEditPanel'
import { Store } from './services/Store'
import NotFound from './Pages/NotFound'
import { theme } from './services/ChakraTheme'

const history = createBrowserHistory()
Store.history = history //save for later

function App() {
  return (
    <HistoryRouter history={history}>
      <ChakraProvider theme={theme}>
        <Routes>
          //unprotected for ondemand clients
          <Route path='/' element={<MonitorEditPanel />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </ChakraProvider>
    </HistoryRouter>
  )
}

export default App
