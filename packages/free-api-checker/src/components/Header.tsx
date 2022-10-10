import { Flex, Image, Spacer } from '@chakra-ui/react'
import { logoTitle } from '../Assets'

const Header = () => (
  <Flex as='nav' py={2} px={4} aria-label='Main Navigation' justifyContent='space-between'>
    <Image src={logoTitle} h='8' display={{ base: 'none', md: 'block' }} />
    <Spacer />
  </Flex>
)

export default Header
