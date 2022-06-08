import {
  Box,
  BoxProps,
} from '@chakra-ui/react'

interface Props extends BoxProps {
  children: React.ReactNode,
}

const Section: React.FC<Props> = (props) => {
  const { children, ...rest } = props
  return (
    <Box bg={'white'} borderRadius={'base'} marginBottom={2} paddingTop={2} paddingBottom={2} paddingLeft={4} paddingRight={4} {...rest}>
      {children}
    </Box>
  )
}

export default Section
