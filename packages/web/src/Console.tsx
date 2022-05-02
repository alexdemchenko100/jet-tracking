import {
  Avatar,
  Box,
  Collapse,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  FlexProps,
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
import { FaBell } from 'react-icons/fa'
import { AiFillGift } from 'react-icons/ai'
import { HiCollection } from 'react-icons/hi'
import React, { ReactNode } from 'react'
import { IconType } from 'react-icons/lib'
import { FiSettings, FiClipboard, FiMenu, FiSearch } from 'react-icons/fi'
import { MdHome, MdKeyboardArrowRight } from 'react-icons/md'
import { logoTitle } from './Assets'
import { Outlet, useNavigate } from 'react-router-dom'
import { signOut, useAuth } from './services/FirebaseAuth'

const SIDEBAR_WIDTH = '40'

interface Props extends FlexProps {
  icon?: IconType
  children: ReactNode
  to?: string
}

export default function Console() {
  const sidebar = useDisclosure()
  const envNav = useDisclosure()
  const navigate = useNavigate()

  const { userInfo: user } = useAuth()

  const NavItem: React.FC<Props> = (props) => {
    const { icon, children, to, ...rest } = props
    return (
      <Flex
        align='center'
        px='4'
        pl='4'
        py='3'
        cursor='pointer'
        color={useColorModeValue('inherit', 'gray.400')}
        _hover={{
          bg: useColorModeValue('gray.100', 'gray.900'),
          color: useColorModeValue('gray.900', 'gray.200'),
        }}
        role='group'
        fontWeight='semibold'
        transition='.15s ease'
        onClick={() => to && navigate(to)}
        {...rest}
      >
        {icon && (
          <Icon
            mx='2'
            boxSize='4'
            _groupHover={{
              color: useColorModeValue('gray.600', 'gray.300'),
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    )
  }

  const SidebarContent = (props: any) => (
    <Box
      as='nav'
      pos='fixed'
      top='0'
      left='0'
      zIndex='sticky'
      h='full'
      pb='10'
      overflowX='hidden'
      overflowY='auto'
      bg={useColorModeValue('white', 'gray.800')}
      borderColor={useColorModeValue('inherit', 'gray.700')}
      borderRightWidth='1px'
      w={SIDEBAR_WIDTH}
      {...props}
    >
      <Flex px='2' py='5' align='center'>
        <Image src={logoTitle} w='50' />
      </Flex>
      <Flex direction='column' as='nav' fontSize='sm' color='gray.600' aria-label='Main Navigation'>
        <NavItem icon={HiCollection} to='/console/monitors'>
          Monitors
        </NavItem>

        <NavItem icon={FiClipboard} onClick={envNav.onToggle}>
          Environments
          <Icon
            as={MdKeyboardArrowRight}
            ml='auto'
            transform={envNav.isOpen ? 'rotate(90deg)' : ''}
          />
        </NavItem>
        <Collapse in={envNav.isOpen}>
          <NavItem pl='12' py='2' to='/console/env/new'>
            New Environment
          </NavItem>
        </Collapse>

        <NavItem icon={AiFillGift}>Dashboards</NavItem>
        <NavItem icon={FiSettings}>Settings</NavItem>
      </Flex>
    </Box>
  )

  return (
    <Box as='section' bg={useColorModeValue('gray.50', 'gray.700')} minH='100vh'>
      <SidebarContent display={{ base: 'none', md: 'unset' }} />
      <Drawer isOpen={sidebar.isOpen} onClose={sidebar.onClose} placement='left'>
        <DrawerOverlay />
        <DrawerContent>
          <SidebarContent w='full' borderRight='none' />
        </DrawerContent>
      </Drawer>
      <Box ml={{ base: 0, md: SIDEBAR_WIDTH }} transition='.3s ease'>
        <Flex
          as='header'
          align='center'
          justify='space-between'
          w='full'
          px='4'
          bg={useColorModeValue('white', 'gray.800')}
          borderBottomWidth='1px'
          borderColor={useColorModeValue('inherit', 'gray.700')}
          h='14'
        >
          <IconButton
            aria-label='Menu'
            display={{ base: 'inline-flex', md: 'none' }}
            onClick={sidebar.onOpen}
            icon={<FiMenu />}
            size='sm'
          />

          <Spacer />
          <Flex align='center'>
            <Icon color='gray.500' as={FaBell} cursor='pointer' />

            <Menu>
              <MenuButton>
                <Avatar
                  ml='4'
                  size='sm'
                  name={user?.displayName || user?.email || ''}
                  src={user?.photoURL ?? undefined}
                  cursor='pointer'
                />
              </MenuButton>
              <MenuList>
                {user && user.displayName && <MenuItem color='purple'>{user.displayName}</MenuItem>}
                {user && user.email && <MenuItem>{user.email}</MenuItem>}
                <MenuDivider />
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

        <Box as='main' m='2'>
          {/* Add content here, remove div below  */}
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
