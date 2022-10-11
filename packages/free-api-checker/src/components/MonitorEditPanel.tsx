import { Box, useMediaQuery, useDisclosure, Heading } from '@chakra-ui/react'
import { Monitor } from '@httpmon/db'

import { useState } from 'react'
import { APIResultByDemand } from './APIResultByDemand'
import Header from './Header'
import Footer from './Footer'
import { MonitorEditor } from './MonitorEditor'
import SplitPane from './SplitPane'

export function MonitorEditPanel() {
  const drawer = useDisclosure()

  const [ondemandMonitor, setOndemandMonitor] = useState<Monitor>()
  const [refreshOnDemand, setRefreshOnDemand] = useState(0)

  const [vertical] = useMediaQuery('(max-width: 1278px)')

  function handleQuickRun(monitor: Monitor) {
    setOndemandMonitor(monitor)
    drawer.onOpen()
    setRefreshOnDemand(refreshOnDemand + 1)
  }

  function onClose() {
    setOndemandMonitor(undefined)
    drawer.onClose()
  }

  return (
    <Box>
      <Header></Header>
      <Box p='5'>
        <Heading variant={'h1'}>Free API Checking</Heading>
        <Box color='gray.300' mt='2'>
          ProAutoma is the next generation monitoring solution for your APIs and Websites. Easy to
          use, Powerful as needed, Global, Integrated alerts.
        </Box>
      </Box>
      <SplitPane orientation={vertical ? 'vertical' : 'horizontal'}>
        <Box>
          <MonitorEditor isVertical={vertical} handleOndemandMonitor={handleQuickRun} />
        </Box>
        {drawer.isOpen && (
          <APIResultByDemand
            onDemandMonitor={ondemandMonitor}
            refresh={refreshOnDemand}
            onClose={onClose}
          />
        )}
      </SplitPane>
      <Footer></Footer>
    </Box>
  )
}
