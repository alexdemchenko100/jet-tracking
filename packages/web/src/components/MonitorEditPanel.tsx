import { Box, useBreakpointValue, useDisclosure, Flex } from '@chakra-ui/react'
import { Monitor } from '@httpmon/db'

import { useState } from 'react'
import { APIResultByDemand } from './APIResultByDemand'
import { MonitorEditor } from './MonitorEditor'
import SplitPane from './SplitPane'
import Section from './Section'
import Text from './Text'
import PrimaryButton from './PrimaryButton'

export function MonitorEditPanel() {
  const drawer = useDisclosure()

  const [ondemandMonitor, setOndemandMonitor] = useState<Monitor>()
  const [refreshOnDemand, setRefreshOnDemand] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

  const vertical = useBreakpointValue({ base: true, xl: false })

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
      <Section>
        <Flex alignItems='center' justify={'space-between'}>
          <Text variant='header' color='black'>Monitors</Text>
          <PrimaryButton
            label='Save Now'
            variant='emphasis'
            color={'white'}
            onClick={() => setModalOpen(true)}
          ></PrimaryButton>
        </Flex>
      </Section>
      <SplitPane orientation={vertical ? 'vertical' : 'horizontal'}>
        <Box>
          <MonitorEditor handleOndemandMonitor={handleQuickRun} isModalOpen={modalOpen} onClose={() => setModalOpen(false)} />
        </Box>
        {drawer.isOpen && (
          <Section height='100%' py='4'>
            <APIResultByDemand
              onDemandMonitor={ondemandMonitor}
              refresh={refreshOnDemand}
              onClose={onClose}
            />
          </Section>
        )}
      </SplitPane>
    </Box>
  )
}
