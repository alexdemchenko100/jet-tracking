import {
  Flex,
  FlexProps,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import React, { ReactNode } from 'react'
import { IconType } from 'react-icons/lib'
import { NavLink, To } from 'react-router-dom'

interface Props extends FlexProps {
  icon?: IconType
  children: ReactNode
  to: To
}

const NavItem: React.FC<Props> = (props) => {
  const { icon, children, to, ...rest } = props
  return (
    <NavLink
      to={to}
      style={({ isActive }) => (isActive ? {
        borderRadius: 28,
        marginBottom: 16,
        background: 'rgba(23, 70, 143, 0.15)',
        color: '#17468F',
      } : {
        color: '#25292F',
        borderRadius: 28,
        marginBottom: 16,
      })}
    >
      <Flex
        align='center'
        px='4'
        pl='4'
        py='3'
        cursor='pointer'
        _hover={{ bg: 'lightgray.100', borderRadius: '28px', color: 'gray.300' }}
        role='group'
        fontWeight='semibold'
        transition='.15s ease'
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
            w={'19px'}
            h={'19px'}
          />
        )}
        {children}
      </Flex>
    </NavLink>
  )
}

export default NavItem
