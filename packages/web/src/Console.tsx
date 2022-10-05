import { useRef, useState } from 'react'
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
  Portal,
  Spacer,
  Tooltip,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { FaRegBell } from 'react-icons/fa'
import {
  FiSettings,
  FiMenu,
  FiPackage,
  FiHome,
  FiActivity,
  FiZap,
  FiBell,
  FiCreditCard,
  FiKey,
  FiShield,
  FiUser,
  FiUsers,
} from 'react-icons/fi'
import { MdOutlineMenu, MdOutlineMenuOpen } from 'react-icons/md'
import { logoTitle } from './Assets'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { signOut, useAuth, switchToAccount } from './services/FirebaseAuth'
import { Text, NavItem } from './components'
import { ChevronDownIcon, ChevronRightIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { UserAccount } from '@httpmon/db'
import { Store } from './services/Store'
import { UserInfo } from './types/common'

const NORMAL_SIDEBAR_WIDTH = '240px'
const COLLAPSED_SIDEBAR_WIDTH = '88px'

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

const SettingsSubMenu = ({
  user,
  onClose,
}: {
  user: UserInfo
  onClose: React.MouseEventHandler
}) => (
  <Flex
    direction='column'
    as='nav'
    ml={4}
    fontSize='sm'
    color='gray.600'
    aria-label='Settings Sub Navigation'
  >
    <NavItem p={2.5} icon={FiUser} to='/console/settings/profile' onClick={onClose}>
      <Text variant='submenu' color='inherit'>
        Profile
      </Text>
    </NavItem>
    <NavItem p={2.5} icon={FiShield} to='/console/settings/security' onClick={onClose}>
      <Text variant='submenu' color='inherit'>
        Security
      </Text>
    </NavItem>
    <NavItem p={2.5} icon={FiBell} to='/console/settings/notifications' onClick={onClose}>
      <Text variant='submenu' color='inherit'>
        Notifications
      </Text>
    </NavItem>
    <NavItem p={2.5} icon={FiKey} to='/console/settings/api-keys' onClick={onClose}>
      <Text variant='submenu' color='inherit'>
        API Keys
      </Text>
    </NavItem>
    <NavItem p={2.5} icon={FiUsers} to='/console/settings/users' onClick={onClose}>
      <Text variant='submenu' color='inherit'>
        Team
      </Text>
    </NavItem>
    {(!user.role || user.role === 'owner') && (
      <NavItem p={2.5} icon={FiCreditCard} to='/console/settings/billing' onClick={onClose}>
        <Text variant='submenu' color='inherit'>
          Billing & Usage
        </Text>
      </NavItem>
    )}
  </Flex>
)

const SettingsDropdownMenu = ({ user }: { user: UserInfo }) => {
  const { pathname } = useLocation()
  const isActive = pathname.includes('/console/settings')
  return (
    <Menu>
      <Tooltip hasArrow label={'Settings'} placement='auto' ml='1'>
        <MenuButton
          px='4'
          py='2'
          bg={isActive ? 'rgba(23, 70, 143, 0.15)' : ''}
          borderRadius='8'
          color={isActive ? '#17468F' : 'inherit'}
          _hover={{ bg: 'lightgray.100', color: 'gray.300' }}
          _active={{ bg: 'lightgray.100', color: 'gray.300' }}
        >
          <Icon
            boxSize={6}
            _groupHover={{
              color: useColorModeValue('gray.600', 'gray.300'),
            }}
            as={FiSettings}
          />
        </MenuButton>
      </Tooltip>
      <Portal>
        <MenuList maxH='64' zIndex={10000}>
          <Link to='/console/settings/profile'>
            <MenuItem icon={<FiUser fontSize={16} />}>
              <Text variant='submenu' color='inherit'>
                Profile
              </Text>
            </MenuItem>
          </Link>
          <Link to='/console/settings/security'>
            <MenuItem icon={<FiShield fontSize={16} />}>
              <Text variant='submenu' color='inherit'>
                Security
              </Text>
            </MenuItem>
          </Link>
          <Link to='/console/settings/notifications'>
            <MenuItem icon={<FiBell fontSize={16} />}>
              <Text variant='submenu' color='inherit'>
                Notifications
              </Text>
            </MenuItem>
          </Link>
          <Link to='/console/settings/api-keys'>
            <MenuItem icon={<FiKey fontSize={16} />}>
              <Text variant='submenu' color='inherit'>
                API Keys
              </Text>
            </MenuItem>
          </Link>
          <Link to='/console/settings/users'>
            <MenuItem icon={<FiUsers fontSize={16} />}>
              <Text variant='submenu' color='inherit'>
                Team
              </Text>
            </MenuItem>
          </Link>
          {(!user.role || user.role === 'owner') && (
            <Link to='/console/settings/billing'>
              <MenuItem icon={<FiCreditCard fontSize={16} />}>
                <Text variant='submenu' color='inherit'>
                  Billing & Usage
                </Text>
              </MenuItem>
            </Link>
          )}
        </MenuList>
      </Portal>
    </Menu>
  )
}

export default function Console() {
  const sidebar = useDisclosure()
  const navigate = useNavigate()

  const { userInfo: user, teams } = useAuth()
  const [menuCollapsed, setMenuCollapsed] = useState<boolean>(false)
  const [settingsMenuVisible, setSettingsMenuVisible] = useState<boolean>(false)
  const SIDEBAR_WIDTH = menuCollapsed ? COLLAPSED_SIDEBAR_WIDTH : NORMAL_SIDEBAR_WIDTH

  const SidebarContent = (props: any) => {
    const closeSubmenu = () => {
      setSettingsMenuVisible(false)
      sidebar.onClose()
    }

    return (
      <Box
        as='nav'
        pos='fixed'
        top='0'
        left='0'
        zIndex='sticky'
        h='full'
        px='2'
        pt={{ base: 5, md: 14 }}
        pb='14'
        overflowX='hidden'
        overflowY='auto'
        bg={useColorModeValue('white', 'gray.800')}
        borderColor={useColorModeValue('inherit', 'gray.700')}
        borderRightWidth='1px'
        width={SIDEBAR_WIDTH}
        {...props}
      >
        <Flex direction='column' as='nav' py={2} aria-label='Main Navigation'>
          <Image src={logoTitle} h='7' display={{ base: 'block', md: 'none' }} />
          <Flex justifyContent='space-between' pb='2'>
            <IconButton
              aria-label='Menu Toggler'
              icon={<MdOutlineMenu fontSize='24' />}
              bg='transparent'
              size='sm'
              mx='5'
              visibility={menuCollapsed ? 'visible' : 'hidden'}
              onClick={() => setMenuCollapsed(false)}
            />
            <IconButton
              aria-label='Menu Toggler'
              icon={<MdOutlineMenuOpen fontSize='24' />}
              bg='transparent'
              size='sm'
              display={{ base: 'none', md: 'flex' }}
              visibility={menuCollapsed ? 'hidden' : 'visible'}
              onClick={() => setMenuCollapsed(true)}
            />
          </Flex>
          <NavItem
            collapsed={menuCollapsed}
            icon={FiHome}
            to='/console/monitors'
            onClick={closeSubmenu}
            tooltip='Dashboard'
          >
            <Text variant='text-field' color='inherit'>
              Dashboard
            </Text>
          </NavItem>
          {user.role && user.role !== 'viewer' && (
            <>
              <NavItem
                collapsed={menuCollapsed}
                icon={FiActivity}
                to='/console/activity'
                onClick={closeSubmenu}
                tooltip='Activity'
              >
                <Text variant='text-field' color='inherit'>
                  Activity
                </Text>
              </NavItem>
              <NavItem
                collapsed={menuCollapsed}
                icon={FiPackage}
                to='/console/envs'
                onClick={closeSubmenu}
                tooltip='Environments'
              >
                <Text variant='text-field' color='inherit'>
                  Environments
                </Text>
              </NavItem>
              <NavItem
                collapsed={menuCollapsed}
                icon={FiZap}
                to='/console/status-pages'
                onClick={closeSubmenu}
                tooltip='Status Pages'
              >
                <Text variant='text-field' color='inherit'>
                  Status Pages
                </Text>
              </NavItem>
              {!menuCollapsed ? (
                <>
                  <NavItem
                    icon={FiSettings}
                    onClick={() => setSettingsMenuVisible(!settingsMenuVisible)}
                  >
                    <Flex alignItems='center' justifyContent='space-between' flex='1'>
                      <Text variant='text-field' color='inherit'>
                        Settings
                      </Text>
                      {settingsMenuVisible ? (
                        <ChevronUpIcon boxSize={6} m='-2' />
                      ) : (
                        <ChevronDownIcon boxSize={6} m='-2' />
                      )}
                    </Flex>
                  </NavItem>
                  {settingsMenuVisible && <SettingsSubMenu user={user} onClose={sidebar.onClose} />}
                </>
              ) : (
                <SettingsDropdownMenu user={user} />
              )}
            </>
          )}
        </Flex>
      </Box>
    )
  }

  const onMobileMenuClick = () => {
    setMenuCollapsed(false)
    sidebar.onOpen()
  }

  return (
    <Box as='section' bg={useColorModeValue('lightgray.100', 'gray.700')} minH='100vh'>
      {/* Header */}
      <Flex
        as='header'
        align='center'
        justify='space-between'
        w='full'
        px='4'
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
          onClick={onMobileMenuClick}
          icon={<FiMenu fontSize={20} />}
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
          <DrawerContent maxW={{ base: '56', md: 'unset' }}>
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
