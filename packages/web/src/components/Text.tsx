import { Box, BoxProps } from '@chakra-ui/react'
import { TextVariants } from '../types/common'

interface Props extends BoxProps {
  variant: TextVariants
  color: string
  showUnderline?: boolean
  children: React.ReactNode
}

const Text: React.FC<Props> = (props) => {
  const { variant, color, showUnderline, children, ...rest } = props
  let fontSize, lineHeight, fontWeight, underlineTop
  switch (variant) {
    case 'header':
      fontSize = 'xl'
      lineHeight = '39px'
      fontWeight = 'extrabold'
      underlineTop = '1.3em'
      break
    case 'title':
      fontSize = 'lg'
      lineHeight = '22px'
      fontWeight = 'bold'
      underlineTop = '1.8em'
      break
    case 'text-field':
      fontSize = 'md'
      lineHeight = '19px'
      fontWeight = 'semibold'
      underlineTop = '1.8em'
      break
    case 'paragraph':
      fontSize = 'md'
      lineHeight = '19px'
      fontWeight = 'normal'
      break
    case 'emphasis':
      fontSize = 'md'
      lineHeight = '19px'
      fontWeight = 'bold'
      break
    case 'submenu':
      fontSize = '14px'
      lineHeight = '17px'
      fontWeight = 'medium'
      break
    case 'details':
      fontSize = 'xs'
      lineHeight = '15px'
      fontWeight = 'bold'
      break
    case 'small':
      fontSize = '10px'
      lineHeight = '12px'
      fontWeight = 'semibold'
    default:
  }

  return (
    <Box
      as='span'
      position='relative'
      color={color}
      fontSize={fontSize}
      fontFamily='heading'
      lineHeight={lineHeight}
      fontWeight={fontWeight}
      {...rest}
    >
      {children}
      {showUnderline && (
        <Box
          w={8}
          position='absolute'
          top={underlineTop}
          left='0'
          h={1}
          bg='darkblue.100'
          borderRadius={4}
        ></Box>
      )}
    </Box>
  )
}

export default Text
