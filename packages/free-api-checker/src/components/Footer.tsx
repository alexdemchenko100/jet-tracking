import { Box, Flex, Image, Link, List, ListItem } from '@chakra-ui/react'
import { logoWhite, twitterImg, discordImg, emailImg } from '../Assets'

function Footer() {
  return (
    <Box color='white' bg='darkgray.100'>
      <Box px='4'>
        <Flex direction={{ base: 'column', md: 'row' }} py={10}>
          <Box>
            <Box fontSize={{ base: '2xl', lg: '3xl' }}>
              Questions? Comments?
              <br />
              Concerns?
            </Box>
            <Box mt={5}>
              <Link
                bg={'white'}
                fontSize='base'
                color='black'
                px='4'
                py='2'
                rounded='base'
                href='https://discord.gg/CkCsSG39jr'
                target='_blank'
              >
                Chat to us on Discord
              </Link>
            </Box>
          </Box>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            alignItems='flex-start'
            justifyContent='flex-end'
            flex='1'
          >
            <List mt={{ base: 6, md: 0 }} ml={{ md: 16, lg: 24 }}>
              <ListItem fontSize='base' mb='4' color='gray.400'>
                <strong>Community</strong>
              </ListItem>
              <Flex
                color='gray.100'
                mb='2'
                whiteSpace='nowrap'
                alignItems='center'
                justifyContent='space-between'
              >
                <a href='https://twitter.com/proautomahq' target='_blank'>
                  <Image width='4' src={twitterImg} />
                </a>
                <a href='https://discord.gg/CkCsSG39jr' target='_blank'>
                  <Image width='4' src={discordImg} />
                </a>
                <a href='mailto:info@proautoma.com'>
                  <Image width='4' src={emailImg} />
                </a>
              </Flex>
            </List>
            <List mt={{ base: 6, md: 0 }} ml={{ md: 16, lg: 24 }}>
              <ListItem fontSize='base' mb='4' color='gray.400'>
                <strong>Company</strong>
              </ListItem>
              <ListItem fontSize='base' whiteSpace='nowrap' mb='2' color='gray.100'>
                <a href='/about'>About us</a>
              </ListItem>
              <ListItem fontSize='base' whiteSpace='nowrap' mb='2' color='gray.100'>
                <a href='/contact'>Contact us</a>
              </ListItem>
            </List>
            <List mt={{ base: 6, md: 0 }} ml={{ md: 16, lg: 24 }}>
              <ListItem fontSize='base' mb='4' color='gray.400'>
                <strong>Learn</strong>
              </ListItem>
              <ListItem fontSize='base' whiteSpace='nowrap' mb='2' color='gray.100'>
                <a href='/blog'>Blog</a>
              </ListItem>
              <ListItem fontSize='base' whiteSpace='nowrap' mb='2' color='gray.100'>
                <a href='/docs'>Docs</a>
              </ListItem>
            </List>
            <List mt={{ base: 6, md: 0 }} ml={{ md: 16, lg: 24 }}>
              <ListItem fontSize='base' mb='4' color='gray.400'>
                <strong>Legal</strong>
              </ListItem>
              <ListItem fontSize='base' whiteSpace='nowrap' mb='2' color='gray.100'>
                <a href='/policies/terms-of-service/'>Terms of Service</a>
              </ListItem>
              <ListItem fontSize='base' whiteSpace='nowrap' mb='2' color='gray.100'>
                <a href='/policies/privacy-policy/'>Privacy Policy</a>
              </ListItem>
              <ListItem fontSize='base' whiteSpace='nowrap' mb='2' color='gray.100'>
                <a href='/policies/cookie-policy/'>Cookie Policy</a>
              </ListItem>
            </List>
          </Flex>
        </Flex>
        <Box borderTop='1px solid' borderColor='gray.600'></Box>
        <Box py='6' textAlign='center'>
          <Flex pb='4' justify='center'>
            <a href='/'>
              <Image w='36' src={logoWhite} />
            </a>
          </Flex>
          <div>Copyright © 2022 ProAutoma, Inc. All rights reserved</div>
        </Box>
      </Box>
    </Box>
  )
}

export default Footer
