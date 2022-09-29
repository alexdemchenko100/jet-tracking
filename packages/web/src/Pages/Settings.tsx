import { Flex } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'

export function SettingsPage() {
  useEffect(() => {
    document.title = 'Settings | ProAutoma'
  }, [])
  return (
    <Flex position='relative' pt='68'>
      <Flex flex={1} height='fit-content' overflow='hidden'>
        <Outlet />
      </Flex>
    </Flex>
  )
}
