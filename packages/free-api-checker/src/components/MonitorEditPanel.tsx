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

  const [vertical] = useMediaQuery('(max-width: 1200px)')

  function handleQuickRun(monitor: Monitor) {
    setOndemandMonitor(monitor)
    setRefreshOnDemand(refreshOnDemand + 1)
  }

  function onClose() {
    setOndemandMonitor(undefined)
    drawer.onClose()
  }

  return (
    <Box>
      <Header></Header>
      <Box p='3'>
        <Heading variant={'h1'}>API Tester</Heading>
        <Box mt='2'>
          Welcome and use this intuitive UI to explore and test REST/SOAP/XML API requests. A free
          account on our main website allows you to save and monitor APIs and get notifications on
          failures.
        </Box>
      </Box>
      <SplitPane orientation={vertical ? 'vertical' : 'horizontal'}>
        <Box>
          <MonitorEditor isVertical={vertical} handleOndemandMonitor={handleQuickRun} />
        </Box>
        <APIResultByDemand onDemandMonitor={ondemandMonitor} refresh={refreshOnDemand} />
      </SplitPane>
      <Footer></Footer>
    </Box>
  )
}
