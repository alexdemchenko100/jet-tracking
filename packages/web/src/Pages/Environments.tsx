import { Flex, Box } from '@chakra-ui/react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import axios from 'axios'
import { MonEnv } from '@httpmon/db'

import { Section, Text, PrimaryButton, EnvNavItem } from '../components'

const SIDEBAR_WIDTH = '200px'

const Sidebar = ({ envs }: { envs: MonEnv[] }) => {
  return (
    <Box as='nav' p='4' bg='white' borderRadius={4} w={SIDEBAR_WIDTH} minH={'calc(100vh - 140px)'}>
      <Text variant='emphasis' color='black'>
        All environments
      </Text>
      <Flex
        direction='column'
        as='nav'
        py={4}
        fontSize='sm'
        color='darkgray.100'
        aria-label='Main Navigation'
      >
        {envs?.map((item) => (
          <EnvNavItem key={item.id} to={`/console/envs/${item.id}`}>
            <Text
              variant='text-field'
              display={'block'}
              color='inherit'
              overflow='hidden'
              textOverflow='ellipsis'
              whiteSpace='nowrap'
            >
              {item.name}
            </Text>
          </EnvNavItem>
        ))}
      </Flex>
    </Box>
  )
}

export function Environments() {
  const navigate = useNavigate()

  const { data: envs } = useQuery<MonEnv[]>(['monenv'], async () => {
    const resp = await axios({
      method: 'GET',
      url: `/environments`,
    })
    return resp.data as MonEnv[]
  })

  return (
    <>
      <Section>
        <Flex alignItems='center' justify={'space-between'}>
          <Text variant='header' color='black'>
            Environments
          </Text>
          <Flex gap={2}>
            <PrimaryButton
              label='Add environment'
              isOutline
              variant='emphasis'
              color={'darkblue.100'}
              py={2}
              onClick={() => navigate('/console/envs/new')}
            ></PrimaryButton>
          </Flex>
        </Flex>
      </Section>
      <Flex>
        <Sidebar envs={envs || []} />
        <Flex flex={1} ml={2} height='fit-content'>
          <Outlet />
        </Flex>
      </Flex>
    </>
  )
}
