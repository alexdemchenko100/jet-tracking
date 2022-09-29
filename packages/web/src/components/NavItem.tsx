import { Flex, FlexProps, Icon, useColorModeValue, Tooltip } from '@chakra-ui/react'
import React, { ReactNode } from 'react'
import { IconType } from 'react-icons/lib'
import { NavLink, To } from 'react-router-dom'

interface Props extends FlexProps {
  icon?: IconType
  children: ReactNode
  to?: To
  collapsed?: boolean
  subMenu?: boolean
  tooltip?: string
}

const NavItem: React.FC<Props> = (props) => {
  const { icon, children, to = '#', collapsed, tooltip, ...rest } = props
  return (
    <NavLink
      to={to}
      style={({ isActive }) =>
        isActive && to !== '#'
          ? {
              borderRadius: collapsed ? 8 : 28,
              marginBottom: 16,
              background: 'rgba(23, 70, 143, 0.15)',
              color: '#17468F',
            }
          : {
              color: '#25292F',
              borderRadius: collapsed ? 8 : 28,
              marginBottom: 16,
            }
      }
    >
      {collapsed ? (
        <Tooltip hasArrow label={tooltip} placement='auto' ml='1'>
          <Flex
            align='center'
            px='4'
            py={2}
            cursor='pointer'
            justifyContent={'center'}
            _hover={{ bg: 'lightgray.100', borderRadius: 8, color: 'gray.300' }}
            role='group'
            fontWeight='semibold'
            transition='.15s ease'
            {...rest}
          >
            {icon && (
              <Icon
                mx={0}
                boxSize={6}
                _groupHover={{
                  color: useColorModeValue('gray.600', 'gray.300'),
                }}
                as={icon}
              />
            )}
          </Flex>
        </Tooltip>
      ) : (
        <Flex
          align='center'
          px='4'
          py={3}
          cursor='pointer'
          justifyContent={'flex-start'}
          _hover={{ bg: 'lightgray.100', borderRadius: 28, color: 'gray.300' }}
          role='group'
          fontWeight='semibold'
          transition='.15s ease'
          {...rest}
        >
          {icon && (
            <Icon
              mx={2}
              boxSize={4}
              _groupHover={{
                color: useColorModeValue('gray.600', 'gray.300'),
              }}
              as={icon}
            />
          )}
          {children}
        </Flex>
      )}
    </NavLink>
  )
}

export default NavItem
