import { MonitorStats } from '@httpmon/db'
import { Box, Flex, Icon } from '@chakra-ui/react'
import { FiTrendingUp, FiTrendingDown, FiPause } from 'react-icons/fi'
import Text from '../components/Text'

export default function StatusUpOrDown({ stats }: { stats?: MonitorStats }) {
  let bErr: boolean = false
  let color: string
  let label: string

  if (!stats || !stats.lastResults || stats.lastResults.length < 1) {
    label = ''
    color = 'gray.500'
  } else if (stats?.status === 'paused') {
    label = 'PAUSE'
    color = 'gold.200'
  } else {
    bErr = Boolean(stats.lastResults[0].err)
    color = bErr ? 'red.200' : 'green.200'
    label = bErr ? 'DOWN' : 'UP'
  }
  return (
    <Flex
      ml='4'
      alignItems='center'
      justifyContent='center'
      bg={color}
      borderRadius='16'
      px='3'
      py='2'
    >
      {label === 'UP' && <Icon color='white' as={FiTrendingUp} />}
      {label === 'DOWN' && <Icon color='white' as={FiTrendingDown} />}
      {label === 'PAUSE' && <Icon color='white' fill='white' as={FiPause} />}
      <Box w={1}></Box>
      <Text variant='details' color='white'>
        {label}
      </Text>
    </Flex>
  )
}
