import {
  Flex,
  FlexProps,
} from '@chakra-ui/react'
import React, { ReactNode } from 'react'
import { IconType } from 'react-icons/lib'
import { NavLink, To } from 'react-router-dom'

interface Props extends FlexProps {
  icon?: IconType
  children: ReactNode
  to: To
}

const EnvNavItem: React.FC<Props> = (props) => {
  const { icon, children, to, ...rest } = props
  return (
    <NavLink
      to={to}
      style={({ isActive }) => (isActive ? {
        marginBottom: 16,
        color: '#17468F',
      } : {
        color: '#25292F',
        marginBottom: 16,
      })}
    >
      <Flex
        align='center'
        px='4'
        pl='4'
        py='3'
        cursor='pointer'
        _hover={{ color: 'darkblue.100' }}
        role='group'
        transition='.15s ease'
        {...rest}
      >
        {children}
      </Flex>
    </NavLink>
  )
}

export default EnvNavItem
