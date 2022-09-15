import { useRef } from 'react'
import {
  Avatar,
  Badge,
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Icon,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spacer,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { FaRegBell } from 'react-icons/fa'
import { FiSettings, FiMenu, FiPackage, FiHome, FiActivity, FiZap } from 'react-icons/fi'
import { logoTitle } from './Assets'
import axios from 'axios'
import { useQuery } from 'react-query'
import { Outlet, useNavigate } from 'react-router-dom'
import { signOut, useAuth, setUser, switchToAccount } from './services/FirebaseAuth'
import { Text, NavItem, Loading } from './components'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { UserAccount, UIState } from '@httpmon/db'
import { Store } from './services/Store'

const SIDEBAR_WIDTH = '240px'

interface SwitchAccountMenuProps {
  teams: readonly UserAccount[]
}

function SwitchAccountMenu({ teams }: SwitchAccountMenuProps) {
  const navigate = useNavigate()
  const user = useAuth()

  const menuBtnRef = useRef<HTMLButtonElement>(null)

  const switchAccount = async (account: UserAccount) => {
    menuBtnRef.current?.click()
    await switchToAccount(account)

    navigate('/console/monitors')
    Store.queryClient?.invalidateQueries(['monitors-list'])
    Store.queryClient?.invalidateQueries(['monitors-stats'])
  }

  return (
    <>
      <MenuItem ref={menuBtnRef} hidden></MenuItem>
      <Menu>
        <MenuButton w='100%'>
          <Flex
            padding='0.3rem 0.8rem'
            cursor='pointer'
            alignItems='center'
            justifyContent='space-between'
          >
            <Text variant='paragraph' color='darkgray.100'>
              Switch account
            </Text>
            <ChevronRightIcon />
          </Flex>
        </MenuButton>
        <MenuList
          position='absolute'
          top='-12'
          right='102%'
          borderRadius='md'
          maxH={96}
          bg='white'
          boxShadow='sm'
          borderWidth='1px'
          marginRight='0.5'
        >
          {teams?.map((team: UserAccount, idx: number) => (
            <MenuItem
              key={idx}
              display='flex'
              alignItems='center'
              justifyContent='space-between'
              _hover={{ bg: 'gray.100' }}
              className={team.accountId == user.userInfo.accountId ? 'selected-menu-item' : ''}
              onClick={() => switchAccount(team)}
            >
              <Flex direction='column' mr='2'>
                <Text
                  variant='details'
                  color='black'
                  textTransform='capitalize'
                  textOverflow='ellipsis'
                  whiteSpace='nowrap'
                  overflow='hidden'
                  w='100%'
                >
                  {team.accountId}
                </Text>
                <Text variant='small' display={'block'} color='gray.300' textTransform='capitalize'>
                  {team.role}
                </Text>
              </Flex>
              {team.accountId == user.userInfo.accountId && (
                <Badge colorScheme='green' variant='solid' fontSize='8px' mb='0.5'>
                  Current
                </Badge>
              )}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
      <MenuDivider />
    </>
  )
}

export default function Console() {
  const sidebar = useDisclosure()
  const navigate = useNavigate()

  const { userInfo: user, teams } = useAuth()

  const SidebarContent = (props: any) => (
    <Box
      as='nav'
      pos='fixed'
      top='0'
      left='0'
      zIndex='sticky'
      h='full'
      px='2'
      py='14'
      overflowX='hidden'
      overflowY='auto'
      bg={useColorModeValue('white', 'gray.800')}
      borderColor={useColorModeValue('inherit', 'gray.700')}
      borderRightWidth='1px'
      w={SIDEBAR_WIDTH}
      {...props}
    >
      <Flex direction='column' as='nav' py={4} aria-label='Main Navigation'>
        <NavItem icon={FiHome} to='/console/monitors'>
          <Text variant='text-field' color='inherit'>
            Dashboard
          </Text>
        </NavItem>
        {user.role && user.role !== 'viewer' && (
          <>
            <NavItem icon={FiActivity} to='/console/activity'>
              <Text variant='text-field' color='inherit'>
                Activity
              </Text>
            </NavItem>
            <NavItem icon={FiPackage} to='/console/envs'>
              <Text variant='text-field' color='inherit'>
                Environments
              </Text>
            </NavItem>
            <NavItem icon={FiZap} to='/console/status-pages'>
              <Text variant='text-field' color='inherit'>
                Status Pages
              </Text>
            </NavItem>
            <NavItem icon={FiSettings} to='/console/settings'>
              <Text variant='text-field' color='inherit'>
                Settings
              </Text>
            </NavItem>
          </>
        )}
      </Flex>
    </Box>
  )

  return (
    <Box as='section' bg={useColorModeValue('lightgray.100', 'gray.700')} minH='100vh'>
      {/* Header */}
      <Flex
        as='header'
        align='center'
        justify='space-between'
        w='full'
        px='6'
        py='3'
        position='fixed'
        top='0'
        zIndex={1300}
        bg={'white'}
        boxShadow='0px 4px 16px #F5F5F5'
        h='14'
      >
        <IconButton
          aria-label='Menu'
          display={{ base: 'inline-flex', md: 'none' }}
          onClick={sidebar.onOpen}
          icon={<FiMenu />}
          size='sm'
        />

        <Image src={logoTitle} h='8' display={{ base: 'none', md: 'block' }} />

        <Spacer />
        <Flex align='center'>
          <Icon color='darkgray.100' fontSize={'lg'} as={FaRegBell} cursor='pointer' />

          <Menu id='profile-button'>
            <MenuButton>
              <Flex>
                <Avatar
                  ml='4'
                  size='sm'
                  name={user?.displayName || user?.email || ''}
                  src={user?.photoURL ?? undefined}
                  cursor='pointer'
                />
                <Flex ml={2} alignItems={'start'} justify='center' flexDir={'column'}>
                  <Text variant='details' color='darkgray.100'>
                    {user.displayName}
                  </Text>
                  <Text variant='small' color='gray.300'>
                    {user.email}
                  </Text>
                </Flex>
              </Flex>
            </MenuButton>
            <MenuList>
              {user && user.displayName && <MenuItem color='purple'>{user.displayName}</MenuItem>}
              {user && user.email && <MenuItem>{user.email}</MenuItem>}
              <MenuDivider />
              {teams && teams?.length > 1 && <SwitchAccountMenu teams={teams}></SwitchAccountMenu>}
              <MenuItem
                onClick={async () => {
                  await signOut()
                  navigate('/')
                }}
              >
                Signout
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
      <Flex>
        <SidebarContent display={{ base: 'none', md: 'unset' }} />
        <Drawer isOpen={sidebar.isOpen} onClose={sidebar.onClose} placement='left'>
          <DrawerOverlay />
          <DrawerContent>
            <SidebarContent w='full' borderRight='none' />
          </DrawerContent>
        </Drawer>
        <Box
          ml={{ base: 0, md: SIDEBAR_WIDTH }}
          pt='14'
          width={{ base: '100%', md: `calc(100% - ${SIDEBAR_WIDTH})` }}
          transition='.3s ease'
        >
          <Box as='main' p='2'>
            <Outlet />
          </Box>
        </Box>
      </Flex>
    </Box>
  )
}
