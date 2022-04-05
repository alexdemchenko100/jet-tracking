import { Box, useBreakpointValue, useDisclosure } from '@chakra-ui/react'
import { Monitor } from '@httpmon/db'

import { useState } from 'react'
import { APIResultByDemand } from './APIResultByDemand'
import { MonitorEditor } from './MonitorEditor'
import SplitPane from './SplitPane'
import 'allotment/dist/style.css'

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

  // let oflow = drawer.isOpen ? 'auto' : 'hidden'

  // return (
  //   <Box h={'90vh'} w={'100%'} overflow='hidden'>
  //     <Allotment ref={ref} vertical={orientation} minSize={400}>
  //       <Box height={'100%'} width={'100%'} overflow={oflow}>
  //         <MonitorEditor handleOndemandMonitor={handleQuickRun} />
  //       </Box>
  //       {drawer.isOpen && (
  //         <Box height={'100%'} width={'100%'} overflow='auto'>
  //           <APIResultByDemand onDemandMonitor={ondemandMonitor} />
  //         </Box>
  //       )}
  //     </Allotment>
  //   </Box>
  // )
}
