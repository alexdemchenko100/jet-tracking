import { Box, useMediaQuery, useDisclosure } from '@chakra-ui/react'
import { Monitor } from '@httpmon/db'

import { useState } from 'react'
import { APIResultByDemand } from './APIResultByDemand'
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
    </Box>
  )
}
