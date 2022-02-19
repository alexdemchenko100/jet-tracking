import { useState } from 'react'

import './App.css'

import { ChakraProvider, Container } from '@chakra-ui/react'
import RealTimeMonitor from './RealTimeMonitor'

function App() {
  return (
    <ChakraProvider>
      <Container maxWidth={'container.xl'} centerContent>
        <RealTimeMonitor />
      </Container>
    </ChakraProvider>
  )
}

export default App
