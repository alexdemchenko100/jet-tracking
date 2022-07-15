import { Flex, Button, Icon, Box, Input, Image, useToast, Grid } from '@chakra-ui/react'
import { Monitor, StatusPage } from '@httpmon/db'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { Section, Text, PrimaryButton, MonitorsSelectModal } from '../components'
import { useQuery } from 'react-query'
import { Store } from '../services/Store'

function EditStatusPage() {
  const { id } = useParams()
  const [formChanged, setFormChanged] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [selectedMons, setSelectedMons] = useState<Monitor[]>([])
  const { register, watch, reset, getValues, setValue, handleSubmit } = useForm<StatusPage>()
  const toast = useToast()
  const navigate = useNavigate()

  watch()

  useEffect(() => {
    const subscription = watch((value) => {
      if (value.name || value.logoUrl || (value.monitors && value.monitors.length > 0)) {
        setFormChanged(true)
      } else {
        setFormChanged(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  useQuery(['status-page'], async () => {
    let resp = await axios({
      method: 'GET',
      url: `/status-pages/${id}`,
    })

    if (resp.status == 200) {
      setValue('name', resp.data.name)
      setValue('logoUrl', resp.data.logoUrl)
      setValue(
        'monitors',
        resp.data.monitors.map((mon: Monitor) => mon.id)
      )
      setSelectedMons(resp.data.monitors)
      setFormChanged(false)
    }
  })

  const cancelChanges = () => {
    reset()
    setSelectedMons([])
    setFormChanged(false)
  }

  const addNewMon = (mons: Monitor[]) => {
    const data = [...selectedMons, ...mons]
    setSelectedMons(data)
    setValue(
      'monitors',
      data.map((mon) => mon.id || '')
    )
  }

  const deleteMon = (index: number) => {
    const arr = [...selectedMons]
    arr.splice(index, 1)
    setSelectedMons(arr)
    setValue(
      'monitors',
      arr.map((mon) => mon.id || '')
    )
  }

  const isImage = (url: string): boolean => {
    return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url)
  }

  const checkFormValidation = (data: StatusPage) => {
    const { name, logoUrl, monitors } = data
    if (!name) {
      return 'Name is required'
    }
    if (!logoUrl) {
      return 'Logo URL is required'
    } else if (logoUrl && !isImage(logoUrl)) {
      return 'Logo URL is invalid'
    }
    if (!monitors || !monitors?.length) {
      return 'Need one monitor at least'
    }
    return
  }

  const saveChanges = async (data: StatusPage) => {
    const error = checkFormValidation(data)
    if (error) {
      toast({
        position: 'top',
        description: error,
        status: 'error',
        duration: 1500,
        isClosable: false,
      })
    } else {
      // Save new env
      const resp = await axios({
        method: 'PUT',
        url: `/status-pages/${id}`,
        data,
      })
      if (resp.data) {
        toast({
          position: 'top',
          description: 'Status Page has been updated successfully.',
          status: 'success',
          duration: 1500,
          isClosable: false,
        })
        Store.queryClient?.invalidateQueries(['status-pages'])
        navigate('/console/status-pages')
      }
    }
  }

  const logoImage = getValues('logoUrl')

  return (
    <form onSubmit={handleSubmit(saveChanges)}>
      <Section py={2} w='100%'>
        <Flex alignItems='center' justifyContent='space-between'>
          <Text variant='header' color='black'>
            Edit Status Page
          </Text>
          <Flex align='center' justifyContent='flex-end' gap={2}>
            <PrimaryButton
              label='Cancel'
              isOutline
              disabled={!formChanged}
              variant='emphasis'
              color={'darkblue.100'}
              onClick={cancelChanges}
            ></PrimaryButton>
            <PrimaryButton
              disabled={!formChanged}
              label='Save'
              variant='emphasis'
              color={'white'}
              type='submit'
            ></PrimaryButton>
          </Flex>
        </Flex>
      </Section>
      <Section pt={4} w='100%' pb={20}>
        <Flex alignItems='flex-end' gap={20}>
          <Box w='50%'>
            <Box>
              <Text variant='details' color='black'>
                Name
              </Text>
              <Input type='text' placeholder='Name' {...register('name')} />
            </Box>
            <Box mt={4}>
              <Text variant='details' color='black'>
                Logo URL
              </Text>
              <Input type='text' placeholder='URL' {...register('logoUrl')} />
            </Box>
          </Box>
          <Flex
            alignItems='center'
            justifyContent='center'
            borderRadius={16}
            overflow='hidden'
            border='1px solid'
            borderColor='gray.200'
            w='32'
            h='32'
          >
            <Text variant='text-field' color='gray.200' position='absolute' zIndex='1'>
              Logo Preview
            </Text>
            {logoImage && isImage(logoImage) && (
              <Image src={logoImage} w='100%' h='100%' position='relative' zIndex={10} />
            )}
          </Flex>
        </Flex>
        <Box mt='6' pb='10'>
          <Flex alignItems='center' justifyContent='space-between'>
            <Text variant='title' color='darkgray.100'>
              Monitors
            </Text>
            <Button px={0} variant='unstyled' onClick={() => setIsModalOpen(true)}>
              <Flex align='center'>
                <Icon
                  bg='rgba(24, 119, 242, 0.15)'
                  p='0.5'
                  width={4}
                  height={4}
                  mr='2'
                  borderRadius='4'
                  color='darkblue.100'
                  as={FiPlus}
                  cursor='pointer'
                />
                <Text variant='text-field' color='darkblue.100'>
                  Add Monitor
                </Text>
              </Flex>
            </Button>
          </Flex>
          <Grid gap={4} mt={4} templateColumns={'1fr 1fr'}>
            {selectedMons.map((monitor: Monitor, index: number) => (
              <Flex
                key={index}
                alignItems='center'
                justifyContent='space-between'
                border='1px solid'
                borderColor='gray.300'
                borderRadius={8}
                px={4}
                py={2}
                gap={4}
              >
                <Flex flexDirection='column' gap={1}>
                  <Text variant='emphasis' color='black'>
                    {monitor.name}
                  </Text>
                  <Text variant='details' color='gray.300'>
                    {monitor.url}
                  </Text>
                </Flex>
                <Button borderRadius='4' bg='lightgray.100' px={3} onClick={() => deleteMon(index)}>
                  <Icon color='gray.300' as={FiTrash2} cursor='pointer' />
                </Button>
              </Flex>
            ))}
          </Grid>
        </Box>
        <MonitorsSelectModal
          key={`monitors-select-modal-${isModalOpen}`}
          onChange={addNewMon}
          disabledItems={selectedMons}
          onClose={() => setIsModalOpen(false)}
          isModalOpen={isModalOpen}
        ></MonitorsSelectModal>
      </Section>
    </form>
  )
}

export default EditStatusPage
