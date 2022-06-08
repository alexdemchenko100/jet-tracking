import {
  Tab,
  TabProps,
} from '@chakra-ui/react'

const MonitorTab: React.FC<TabProps> = (props) => {
  const { children, ...rest } = props
  return (
    <Tab
      color='darkgray.100'
      minW='100px'
      fontWeight='600'
      _selected={{ fontWeight: '700', color: 'darkblue.100', borderBottomColor: 'darkblue.100' }}
      {...rest}
    >
      {children}
    </Tab>
  )
}

export default MonitorTab
