import { Flex, Image, Spacer } from '@chakra-ui/react'
import { logoTitle } from '../Assets'

const Header = () => (
  <Flex as='nav' py={2} px={4} aria-label='Main Navigation' justifyContent='space-between'>
    <a href='https://www.proautoma.com/'>
      <Image src={logoTitle} h='8' display={{ base: 'none', md: 'block' }} />
    </a>
    <Spacer />
  </Flex>
)

export default Header
