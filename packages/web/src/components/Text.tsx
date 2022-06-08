import {
  Box,
  BoxProps,
} from '@chakra-ui/react'
import { TextVariants } from '../types/common'

interface Props extends BoxProps {
  variant: TextVariants,
  color: string,
  children: React.ReactNode,
}

const Text: React.FC<Props> = (props) => {
  const { variant, color, children } = props
  return (
    <>
      {variant === 'header' && (
        <Box as='span' color={color} fontSize='xl' fontFamily='heading' lineHeight='39px' fontWeight='extrabold'>
          {children}
        </Box>
      )}
      {variant === 'title' && (
        <Box as='span' color={color} fontSize='lg' fontFamily='heading' lineHeight='22px' fontWeight='bold'>
          {children}
        </Box>
      )}
      {variant === 'text-field' && (
        <Box as='span' color={color} fontSize='md' fontFamily='heading' lineHeight='19px' fontWeight='semibold'>
          {children}
        </Box>
      )}
      {variant === 'paragraph' && (
        <Box as='span' fontSize='md' fontFamily='heading' lineHeight='19px' fontWeight='normal'>
          {children}
        </Box>
      )}
      {variant === 'emphasis' && (
        <Box as='span' color={color} fontSize='md' fontFamily='heading' lineHeight='19px' fontWeight='bold'>
          {children}
        </Box>
      )}
      {variant === 'details' && (
        <Box as='span' color={color} fontSize='xs' fontFamily='heading' lineHeight='15px' fontWeight='bold'>
          {children}
        </Box>
      )}
    </>
  )
}

export default Text
