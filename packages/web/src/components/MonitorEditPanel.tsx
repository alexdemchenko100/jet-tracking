import { Box, useMediaQuery, useDisclosure, Flex } from '@chakra-ui/react'
import { Monitor } from '@httpmon/db'

import { useState } from 'react'
import { APIResultByDemand } from './APIResultByDemand'
import { MonitorEditor } from './MonitorEditor'
import SplitPane from './SplitPane'
import Section from './Section'
import Text from './Text'
import PrimaryButton from './PrimaryButton'

interface Props {
  open: () => void,
}

function EditorHeader({ open }: Props) {
  return (
    <Section>
      <Flex alignItems='center' justify={'space-between'}>
        <Text variant='header' color='black'>Monitors</Text>
        <PrimaryButton
          label='Save Now'
          variant='emphasis'
          color={'white'}
          onClick={open}
        ></PrimaryButton>
      </Flex>
    </Section>
  )
}

export function MonitorEditPanel() {
  const drawer = useDisclosure()

  const [ondemandMonitor, setOndemandMonitor] = useState<Monitor>()
  const [refreshOnDemand, setRefreshOnDemand] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

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

  function openModal() {
    setModalOpen(true)
  }

  return (
    <Box>
      {!vertical && <EditorHeader open={openModal} />}
      <SplitPane orientation={vertical ? 'vertical' : 'horizontal'}>
        <Box>
          {vertical && <EditorHeader open={openModal} />}
          <MonitorEditor handleOndemandMonitor={handleQuickRun} isModalOpen={modalOpen} onClose={() => setModalOpen(false)} />
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
