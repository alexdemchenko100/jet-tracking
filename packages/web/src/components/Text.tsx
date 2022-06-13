import {
  Box,
  BoxProps,
} from '@chakra-ui/react'
import { TextVariants } from '../types/common'

interface Props extends BoxProps {
  variant: TextVariants,
  color: string,
  showUnderline?: boolean,
  children: React.ReactNode,
}

const Text: React.FC<Props> = (props) => {
  const { variant, color, showUnderline, children, ...rest } = props
  let fontSize, lineHeight, fontWeight;
  switch (variant) {
    case 'header':
      fontSize = 'xl'
      lineHeight='39px'
      fontWeight='extrabold'
      break;
    case 'title':
      fontSize = 'lg'
      lineHeight='22px'
      fontWeight='bold'
      break;
    case 'text-field':
      fontSize = 'md'
      lineHeight='19px'
      fontWeight='semibold'
      break;
    case 'paragraph':
      fontSize = 'md'
      lineHeight='19px'
      fontWeight='normal'
      break;
    case 'emphasis':
      fontSize = 'md'
      lineHeight='19px'
      fontWeight='bold'
      break;
    case 'details':
      fontSize = 'xs'
      lineHeight='15px'
      fontWeight='bold'
      break;
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
        <Box w={8} position='absolute' bottom='-1.5' left='0' h={1} bg='green.200' borderRadius={4}></Box>
      )}
    </Box>
  )
}

export default Text
