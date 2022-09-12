import { Flex, Box } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { FiUser, FiShield, FiBell, FiUsers, FiCreditCard, FiKey } from 'react-icons/fi'
import { Text, NavItem } from '../components'
import { useAuth } from '../services/FirebaseAuth'
import { useEffect } from 'react'

const SIDEBAR_WIDTH = '240px'

const SettingsSidebar = (props: any) => {
  const { userInfo } = useAuth()

  return (
    <Box
      as='nav'
      px='4'
      bg='white'
      borderRadius={4}
      minW={SIDEBAR_WIDTH}
      minH={'calc(100vh - 140px)'}
      {...props}
    >
      <Flex
        direction='column'
        as='nav'
        py={4}
        fontSize='sm'
        color='gray.600'
        aria-label='Main Navigation'
      >
        <NavItem icon={FiUser} to='/console/settings/profile'>
          <Text variant='text-field' color='inherit'>
            Profile
          </Text>
        </NavItem>

        <NavItem icon={FiShield} to='/console/settings/security'>
          <Text variant='text-field' color='inherit'>
            Security
          </Text>
        </NavItem>
        <NavItem icon={FiBell} to='/console/settings/notifications'>
          <Text variant='text-field' color='inherit'>
            Notifications
          </Text>
        </NavItem>
        <NavItem icon={FiKey} to='/console/settings/api-keys'>
          <Text variant='text-field' color='inherit'>
            API Keys
          </Text>
        </NavItem>
        <NavItem icon={FiUsers} to='/console/settings/users'>
          <Text variant='text-field' color='inherit'>
            Team
          </Text>
        </NavItem>
        {(!userInfo.role || userInfo.role === 'owner') && (
          <NavItem icon={FiCreditCard} to='/console/settings/billing'>
            <Text variant='text-field' color='inherit'>
              Billing & Usage
            </Text>
          </NavItem>
        )}
      </Flex>
    </Box>
  )
}

export function SettingsPage() {
  useEffect(() => {
    document.title = 'Settings | ProAutoma'
  }, [])
  return (
    <Flex position='relative' pt='68'>
      <SettingsSidebar />
      <Flex flex={1} ml={2} height='fit-content' overflow='hidden'>
        <Outlet />
      </Flex>
    </Flex>
  )
}
