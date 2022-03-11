import { ChevronDownIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItemOption,
  MenuList,
  Spacer,
  Tag,
} from '@chakra-ui/react'
import { Monitor } from '@httpmon/db'
import axios from 'axios'
import { useQuery } from 'react-query'
import { useNavigate, useParams } from 'react-router-dom'
import MonitorResults from './MonitorResults'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { useMemo } from 'react'

dayjs.extend(duration)

function formatFrequency(freq: number) {
  let fmt = 'Every '
  let d = dayjs.duration(freq, 'seconds')
  let [sec, minutes, hour] = [d.seconds(), d.minutes(), d.hours()]

  if (hour) {
    fmt += `${hour} hours `
  }
  if (minutes > 0) {
    fmt += `${minutes} minute` + (minutes == 1 ? ' ' : 's ')
  }
  if (sec) {
    fmt += `${sec} seconds`
  }
  return fmt
}

export function MonitorStats() {
  const navigate = useNavigate()
  const { id } = useParams()

  if (!id) {
    return <p>Missing id: Need to show stats</p>
  }

  const {
    isLoading,
    data: mon,
    error,
  } = useQuery<Monitor>(id, async () => {
    const resp = await axios({
      method: 'GET',
      url: `/monitors/${id}`,
    })
    return resp.data
  })

  const freqFormat = useMemo(() => formatFrequency(mon?.frequency ?? 0), [mon])

  return (
    <Flex direction='column'>
      <Flex justifyContent='end'>
        <Menu>
          <MenuButton
            alignSelf='center'
            rightIcon={<ChevronDownIcon />}
            variant='solid'
            mx='1em'
            size='xs'
            as={Button}
            colorScheme='blue'
          >
            Actions
          </MenuButton>
          <MenuList color='gray.800' zIndex='3'>
            <MenuGroup onChange={(e) => {}}>
              <MenuItemOption onClick={() => navigate(`/console/monitors/${id}/edit`)}>
                Edit
              </MenuItemOption>
              <MenuItemOption>Delete</MenuItemOption>
            </MenuGroup>
          </MenuList>
        </Menu>
      </Flex>

      {mon && (
        <Box>
          <Flex direction='column'>
            <Heading size='lg'>{mon.name}</Heading>
            <Flex mt='4' mb='4' alignItems='center'>
              <Tag size='md' colorScheme='blue'>
                {mon.method}
              </Tag>
              <Heading size='md' ml='4'>
                {mon.url}
              </Heading>
              <Tag size='lg' ml='4' colorScheme='green'>
                {freqFormat}
              </Tag>
            </Flex>
          </Flex>
        </Box>
      )}
      <Divider size='md' />
      <MonitorResults />
    </Flex>
  )
}
