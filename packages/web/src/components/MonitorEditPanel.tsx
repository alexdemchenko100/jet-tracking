import { Box, useBreakpointValue, useDisclosure } from '@chakra-ui/react'
import { Monitor } from '@httpmon/db'

import { useState } from 'react'
import { APIResultByDemand } from './APIResultByDemand'
import { MonitorEditor } from './MonitorEditor'
import SplitPane from './SplitPane'

export function MonitorEditPanel() {
  const drawer = useDisclosure()

  const [ondemandMonitor, setOndemandMonitor] = useState<Monitor>()

  const vertical = useBreakpointValue({ base: true, lg: false })

  function handleQuickRun(monitor: Monitor) {
    setOndemandMonitor(monitor)
    drawer.onOpen()
  }

  return (
    <Box>
      <SplitPane orientation={vertical ? 'vertical' : 'horizontal'}>
        <Box overflow='hidden'>
          <MonitorEditor handleOndemandMonitor={handleQuickRun} />
        </Box>
        {drawer.isOpen && (
          <Box overflow='auto'>
            <APIResultByDemand onDemandMonitor={ondemandMonitor} />
          </Box>
        )}
      </SplitPane>
    </Box>
  )
}
