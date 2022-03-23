import { ChevronDownIcon } from '@chakra-ui/icons'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Divider,
  Flex,
  Grid,
  Heading,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItemOption,
  MenuList,
  Tag,
  useDisclosure,
} from '@chakra-ui/react'
import { Monitor } from '@httpmon/db'
import axios from 'axios'
import { useMutation, useQuery } from 'react-query'
import { useNavigate, useParams } from 'react-router-dom'
import MonitorResultTable from './MonitorResultTable'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { useMemo, useRef } from 'react'
import { MonitorTimeChart } from './MonitorTimeChart'

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

interface DeleteProps {
  id: string
}
function DoubleCheckDelete({ id }: DeleteProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef(null)
  const navigate = useNavigate()

  const {
    mutateAsync: deleteMonitor,
    isLoading: isDeleteing,
    error: deleteError,
  } = useMutation<number, Error>(async () => {
    const resp = await axios({
      method: 'DELETE',
      url: `/monitors/${id}`,
    })
    return resp.data
  })

  async function onDelete() {
    onClose()
    deleteMonitor()
    navigate('/console/monitors')
  }

  return (
    <>
      <MenuItemOption onClick={onOpen}>Delete</MenuItemOption>
      <AlertDialog
        motionPreset='slideInBottom'
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>Deleting monitor</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure you want to delete this monitor? All corresponding monitor results will be
            deleted permanently.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              No
            </Button>
            <Button colorScheme='red' onClick={onDelete} ml={3}>
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function MonitorView() {
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
    <Grid gap='1em'>
      <Flex justifyContent='end'>
        <Menu>
          <MenuButton
            alignSelf='center'
            variant='outline'
            mx='1em'
            size='sm'
            as={Button}
            colorScheme='blue'
            onClick={() => navigate(`/console/monitors/${id}/edit`)}
          >
            Edit
          </MenuButton>
        </Menu>
        <Menu>
          <MenuButton
            alignSelf='center'
            rightIcon={<ChevronDownIcon />}
            variant='outline'
            mx='1em'
            size='sm'
            as={Button}
            colorScheme='blue'
          >
            Actions
          </MenuButton>
          <MenuList color='gray.800' zIndex='3'>
            <MenuGroup onChange={(e) => {}}>
              <DoubleCheckDelete id={id} />
            </MenuGroup>
          </MenuList>
        </Menu>
      </Flex>

      {mon && (
        <>
          <Heading size='lg'>{mon.name}</Heading>
          <Flex alignItems='center'>
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
          <MonitorTimeChart id={id} width='800px' height='200px' />
        </>
      )}

      <Divider />
      <MonitorResultTable />
    </Grid>
  )
}
