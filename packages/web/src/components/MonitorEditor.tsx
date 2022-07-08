import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  FormControl,
  Grid,
  Icon,
  Input,
  Select,
  Slider,
  SliderMark,
  SliderThumb,
  SliderFilledTrack,
  SliderTrack,
  Stack,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react'
import { Monitor, MonitorAssertion, MonitorTuples } from '@httpmon/db'
import React, { useEffect, useRef } from 'react'
import { FormProvider, useFieldArray, useForm, useFormContext, Controller } from 'react-hook-form'

import { FiPlus, FiTrash2, FiSearch } from 'react-icons/fi'
import { useMutation, useQuery } from 'react-query'
import axios from 'axios'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { MonitorAuthEditor } from './MonitorAuthEditor'
import {
  getRegionsFromShowLocations,
  getShowLocationsFromRegions,
  MonitorLocation,
  syncShowLocationsWithStore,
} from '../services/MonitorLocations'
import { Store } from '../services/Store'
import { frequencyMSToScale, FrequencyScales, scaleToFrequencyMS } from '../services/FrequencyScale'
import { MonitorNotifications } from './MonitorNotifications'
import { MonitorBodyEditor } from './MonitorBodyEditor'
import Section from '../components/Section'
import PrimaryButton from '../components/PrimaryButton'
import Text from '../components/Text'
import MonitorTab from '../components/MonitorTab'
import { MonitorPreScriptEditor } from './MonitorPreScriptEditor'

function SliderThumbWithTooltip() {
  const { control } = useFormContext()
  const [showTooltip, setShowTooltip] = React.useState(false)
  return (
    <Controller
      control={control}
      name='frequencyScale'
      render={({ field }) => {
        return (
          <Slider
            id='slider'
            defaultValue={0}
            min={0}
            max={FrequencyScales.length - 1}
            step={1}
            value={field.value}
            onChange={(v) => {
              field.onChange(v)
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {FrequencyScales.map((scale, index) => {
              let ml
              switch (index) {
                case 0:
                  ml = '-1.5'
                  break
                case FrequencyScales.length - 1:
                  ml = '-5'
                  break
                default:
                  ml = '-3'
              }
              return (
                <SliderMark key={scale.label} value={scale.scaleIndex} mt='2' ml={ml} fontSize='sm'>
                  <Text color='gray.300' variant='text-field'>
                    {scale.label}
                  </Text>
                </SliderMark>
              )
            })}

            <SliderTrack bg={'gray.200'} h={2} borderRadius={8}>
              <SliderFilledTrack bg={'darkblue.100'} h={2} borderRadius={8} />
            </SliderTrack>
            <SliderThumb
              h={4}
              w={4}
              bg={'darkblue.100'}
              border='1px'
              borderColor={'white'}
              borderStyle='solid'
            />
          </Slider>
        )
      }}
    />
  )
}

interface TupleProps {
  name: string
}
function TupleEditor({ name }: TupleProps) {
  const { control, register } = useFormContext()
  const {
    fields: tuples,
    append,
    remove,
  } = useFieldArray({
    name: name,
    control,
  })

  const nameToLabel = (name: string) => {
    switch (name) {
      case 'headers':
        return 'Add Header'
      case 'queryParams':
        return 'Add Query Param'
      case 'env':
        return 'Add Env Variable'
      default:
        return ''
    }
  }

  return (
    <>
      <Box>
        {tuples.map((field, index) => (
          <Flex key={field.id} mb='3'>
            <Input
              borderRadius={8}
              color='gray.300'
              borderColor='gray.200'
              type='text'
              {...register(`${name}.${index}.0` as const)}
              placeholder='Name'
            />
            <Input
              borderRadius={8}
              color='gray.300'
              borderColor='gray.200'
              type='text'
              ml='2'
              {...register(`${name}.${index}.1` as const)}
              placeholder='Value'
            />

            <Button
              ml='2'
              borderRadius='4'
              bg='lightgray.100'
              color=''
              onClick={() => remove(index)}
            >
              <Icon color='gray.300' as={FiTrash2} cursor='pointer' />
            </Button>
          </Flex>
        ))}
      </Box>
      <Button px={0} variant='unstyled' onClick={() => append([['', '']])}>
        <Flex align='center'>
          <Icon
            bg='lightgray.100'
            p='4px'
            width={6}
            height={6}
            mr='2'
            borderRadius='4'
            color='darkblue.100'
            as={FiPlus}
            cursor='pointer'
          />
          <Text variant='text-field' color='darkblue.100'>
            {nameToLabel(name)}
          </Text>
        </Flex>
      </Button>
    </>
  )
}

/**
 * ref: https://github.com/tuannguyensn2001/se06-7.1/blob/e061216df0019a83d60bb16b42381af3e6d0a6c2/frontend_next/features/my_models_editor/components/Setting/Rotate/index.jsx#L3
 *
 */
function Locations() {
  const { control } = useFormContext()
  const { fields: showLocations } = useFieldArray({
    name: 'showLocations',
  })

  return (
    <CheckboxGroup>
      <Stack direction='row'>
        {showLocations.map((locEntry, index) => (
          <Controller
            key={locEntry.id}
            control={control}
            name={`showLocations.${index}.set`}
            render={({ field }) => {
              return (
                <Checkbox
                  colorScheme='cyan'
                  borderRadius={4}
                  width={'100%'}
                  isChecked={field.value}
                  onChange={field.onChange}
                >
                  <Text variant='text-field' color='gray.300'>
                    {(locEntry as any)['name']}
                  </Text>
                </Checkbox>
              )
            }}
          />
        ))}
      </Stack>
    </CheckboxGroup>
  )
}

function Assertions() {
  const { control, register, watch } = useFormContext()
  const {
    fields: assertions,
    append,
    remove,
  } = useFieldArray({
    name: 'assertions',
    control,
  })

  const assertValues: MonitorAssertion[] = watch('assertions')

  function showNameField(assertion: MonitorAssertion) {
    return assertion.type == 'header' || assertion.type == 'jsonBody'
  }

  function isStringField(assertion: MonitorAssertion) {
    return assertion.type == 'header' || assertion.type == 'body' || assertion.type == 'jsonBody'
  }
  function placeholder(type: string) {
    switch (type) {
      case 'header':
        return 'Header Name'
      case 'jsonBody':
        return 'JSON Path'
    }
    return ''
  }

  return (
    <>
      <Grid gap='3'>
        {assertions.map((field, index) => (
          <Flex key={field.id} gap='2'>
            <Select
              borderRadius={8}
              color='gray.300'
              borderColor='gray.200'
              {...register(`assertions.${index}.type`)}
            >
              <option value='code'>Code</option>
              <option value='totalTime'>Total Time (ms)</option>
              <option value='certExpiryDays'>Days to Cert Expiry</option>
              <option value='header'>Header</option>
              <option value='body'>Body</option>
              <option value='jsonBody'>JSON Body</option>
            </Select>

            {showNameField(assertValues[index]) && (
              <Input
                borderRadius={8}
                color='gray.300'
                borderColor='gray.200'
                type='text'
                {...register(`assertions.${index}.name` as const)}
                placeholder={placeholder(assertValues[index].type)}
              />
            )}

            <Select
              borderRadius={8}
              color='gray.300'
              borderColor='gray.200'
              defaultValue='='
              {...register(`assertions.${index}.op`)}
            >
              {isStringField(assertValues[index]) && (
                <>
                  <option value='contains'>Contains</option>
                  <option value='matches'>Matches (regex)</option>
                </>
              )}
              <option value='='>Equal to</option>
              <option value='!='>Not equal to</option>
              <option value='>'>Greater than</option>
              <option value='<'>Less than</option>
            </Select>
            <Input
              borderRadius={8}
              color='gray.300'
              borderColor='gray.200'
              type='text'
              {...register(`assertions.${index}.value` as const)}
              placeholder='Value'
            />

            <Button borderRadius='4' bg='lightgray.100' color='' onClick={() => remove(index)}>
              <Icon color='gray.300' as={FiTrash2} cursor='pointer' />
            </Button>
          </Flex>
        ))}
      </Grid>
      <Button mt={3} px={0} variant='unstyled' onClick={() => append([{ type: '', value: '' }])}>
        <Flex align='center'>
          <Icon
            bg='lightgray.100'
            p='4px'
            width={6}
            height={6}
            mr='2'
            borderRadius='4'
            color='darkblue.100'
            as={FiPlus}
            cursor='pointer'
          />
          <Text variant='text-field' color='darkblue.100'>
            Add new
          </Text>
        </Flex>
      </Button>
    </>
  )
}

interface EditProps {
  handleOndemandMonitor: (mon: Monitor) => void
  isModalOpen: boolean
  onClose: () => void
}

interface OptionProps {
  children: React.ReactNode
  value: string
}

function SelectOption(props: OptionProps) {
  const { children, ...rest } = props
  return (
    <option style={{ background: 'transparent' }} {...rest}>
      {children}
    </option>
  )
}

export function MonitorEditor({ handleOndemandMonitor, isModalOpen, onClose }: EditProps) {
  //id tells apart Edit to a new check creation
  const { id } = useParams()

  let [searchParams, _] = useSearchParams()
  const queryUrl = searchParams.get('url')
  const queryMethod = searchParams.get('method')
  const runOnDemand = useRef<boolean>(Boolean(searchParams.get('run')))

  useEffect(() => {
    if (runOnDemand.current) {
      runOnDemand.current = false
      handleQuickRun()
    }
  }, [])

  interface FormMonitor extends Monitor {
    frequencyScale: number
    showLocations: MonitorLocation[]
  }

  const methods = useForm<FormMonitor>({
    defaultValues: {
      headers: [] as MonitorTuples,
      queryParams: [] as MonitorTuples,
      env: [] as MonitorTuples,
      assertions: [{ type: 'code', op: '=', value: '200' }] as MonitorAssertion[],
      frequencyScale: Store.UIState.editor.frequencyScale,
      showLocations: Store.UIState.editor.monitorLocations,
      auth: {},
      notifications: { useGlobal: true, channels: [] },
      bodyType: '',
      body: '',
      preScript: '',
      method: queryMethod || 'GET',
      url: queryUrl || '',
    },
  })

  const {
    register,
    reset,
    watch,
    handleSubmit,
    formState: { errors },
    getValues,
  } = methods

  const { isLoading, error: loadError } = useQuery<FormMonitor>(
    id || 'load',
    async () => {
      const resp = await axios({
        method: 'GET',
        url: `/monitors/${id}`,
      })
      //reset the form data directly
      const formMon: FormMonitor = {
        ...resp.data,
      }
      formMon.frequencyScale = frequencyMSToScale(formMon.frequency)
      formMon.showLocations = getShowLocationsFromRegions(resp.data.locations)

      reset(formMon)
      return formMon
    },
    {
      enabled: Boolean(id),
    }
  )

  const {
    mutateAsync: createMonitor,
    isLoading: isCreating,
    error: createError,
  } = useMutation<Monitor, Error, Monitor>(async (data: Monitor) => {
    const method = id ? 'POST' : 'PUT'
    const url = id ? `/monitors/${id}` : '/monitors'
    const resp = await axios({
      method,
      url,
      data: { ...data },
    })
    return resp.data as Monitor
  })

  const watched = watch()
  console.log(watched)

  function handleQuickRun() {
    handleOndemandMonitor(prepareMonitor(watched))
  }

  function numValues<T extends 'headers' | 'queryParams' | 'env'>(name: T) {
    const values = getValues(name)

    if (values && values.length > 0) {
      return values.filter((item) => Boolean(item[0])).length
    }
    return 0
  }

  function hasValidAuth() {
    if (watched.auth?.type === 'basic') {
      if (watched.auth?.basic?.username) return true
    }
    if (watched.auth?.type == 'bearer') {
      if (watched.auth?.bearer?.token) return true
    }
    return false
  }

  function hasValidBody() {
    return watched.bodyType != '' && Boolean(watched.body)
  }

  const toast = useToast()
  const navigate = useNavigate()

  function prepareMonitor(data: FormMonitor): Monitor {
    //cleanse data to become the monitor
    data.frequency = scaleToFrequencyMS(data.frequencyScale)
    data.locations = getRegionsFromShowLocations(data.showLocations)
    syncShowLocationsWithStore(data.showLocations)
    Store.UIState.editor.frequencyScale = data.frequencyScale

    let { frequencyScale, showLocations, ...monitor } = data //remove scale

    //remove empty fields from monitor
    if (monitor.headers && monitor.headers.length > 0) {
      monitor.headers = monitor.headers.filter((item) => item[0])
    }

    if (monitor.queryParams && monitor.queryParams.length > 0) {
      monitor.queryParams = monitor.queryParams.filter((item) => item[0])
    }

    if (monitor.env && monitor.env.length > 0) {
      monitor.env = monitor.env.filter((item) => item[0])
    }

    if (monitor.auth) {
      if (monitor.auth.type == 'none') {
        monitor.auth = {}
      } else if (monitor.auth.type == 'basic') {
        delete monitor.auth.bearer
      } else if (monitor.auth.type == 'bearer') {
        delete monitor.auth.basic
      }
    }
    return monitor
  }

  async function handleCreation(data: FormMonitor) {
    const monitor = prepareMonitor(data)
    const updating = Boolean(monitor.id)
    const monResp = await createMonitor(monitor)

    if (monResp.id) {
      onClose() // close save modal
      Store.queryClient?.invalidateQueries(['monitors-list'])
      Store.queryClient?.invalidateQueries(['monitors-stats'])
      toast({
        position: 'top',
        title: 'Monitor ' + updating ? 'updated.' : 'created',
        description: 'Your monitor is ready now!',
        status: 'success',
        duration: 2000,
        isClosable: true,
        onCloseComplete: () => {
          if (!updating) navigate('/console/monitors')
        },
      })
    }
  }

  return (
    <Box>
      <FormProvider {...methods}>
        <form>
          <Box>
            <Flex minH='100vh' justify='start' direction='column'>
              <Section paddingTop='29px' paddingBottom='10px' height='440px'>
                <Flex justify='space-between' alignItems='center'>
                  <Flex
                    alignItems='center'
                    padding={1}
                    borderRadius='3xl'
                    border='1px'
                    flex={1}
                    borderColor='gray.200'
                    borderStyle='solid'
                  >
                    <FormControl id='method' maxW='32'>
                      <Select
                        bg='rgba(16, 178, 215, 0.1)'
                        color='lightblue.200'
                        border='0'
                        borderRadius='3xl'
                        fontWeight='bold'
                        {...register('method')}
                      >
                        <SelectOption value='GET'>GET</SelectOption>
                        <SelectOption value='POST'>POST</SelectOption>
                        <SelectOption value='PUT'>PUT</SelectOption>
                        <SelectOption value='PATCH'>PATCH</SelectOption>
                        <SelectOption value='DELETE'>DELETE</SelectOption>
                        <SelectOption value='OPTIONS'>OPTIONS</SelectOption>
                      </Select>
                    </FormControl>

                    <FormControl id='url' ml='3'>
                      <InputGroup>
                        <InputLeftElement
                          pointerEvents='none'
                          fontSize='2xl'
                          height='1em'
                          color='gray.300'
                          children={<FiSearch />}
                        />
                        <Input
                          variant='unstyled'
                          fontWeight='bold'
                          color='gray.300'
                          placeholder='https://'
                          type='url'
                          {...register('url')}
                        />
                      </InputGroup>
                    </FormControl>
                  </Flex>

                  <PrimaryButton
                    label='Run now'
                    variant='emphasis'
                    color={'white'}
                    disabled={watched.url == ''}
                    onClick={handleQuickRun}
                    marginLeft={2}
                    padding={'14px 16px 15px'}
                  ></PrimaryButton>
                </Flex>

                <Tabs mt='4'>
                  <TabList borderBottomColor='lightgray.100'>
                    <MonitorTab>
                      Body
                      {hasValidBody() && <sup color='green'>1</sup>}
                    </MonitorTab>
                    <MonitorTab>
                      Headers
                      {numValues('headers') > 0 && (
                        <sup color='green'>&nbsp;{numValues('headers')}</sup>
                      )}
                    </MonitorTab>
                    <MonitorTab>
                      Auth
                      {hasValidAuth() && <sup color='green'>1</sup>}
                    </MonitorTab>
                    <MonitorTab>Setup Script</MonitorTab>
                    <MonitorTab>
                      Query Params
                      {numValues('queryParams') > 0 && (
                        <sup color='green'>&nbsp;{numValues('queryParams')}</sup>
                      )}
                    </MonitorTab>
                    <MonitorTab>
                      Env Variables
                      {numValues('env') > 0 && <sup color='green'>&nbsp;{numValues('env')}</sup>}
                    </MonitorTab>
                  </TabList>

                  <TabPanels>
                    <TabPanel px='0' pt='6' pb='0'>
                      <MonitorBodyEditor />
                    </TabPanel>
                    <TabPanel px='0' pt='6' pb='0'>
                      <TupleEditor name='headers' />
                    </TabPanel>
                    <TabPanel px='0' pt='6' pb='0'>
                      <MonitorAuthEditor />
                    </TabPanel>
                    <TabPanel px='0' pt='6' pb='0'>
                      <MonitorPreScriptEditor />
                    </TabPanel>
                    <TabPanel px='0' pt='6' pb='0'>
                      <TupleEditor name='queryParams' />
                    </TabPanel>
                    <TabPanel px='0' pt='6' pb='0'>
                      <TupleEditor name='env' />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Section>

              <Section py='4'>
                <Text variant='title' color='black'>
                  Choose Test criteria
                </Text>
                <Box pt='6' pb='0'>
                  <Assertions />
                </Box>
              </Section>

              <Section py='4'>
                <Text variant='title' color='black'>
                  How Often To Run?
                </Text>
                <Box pt='6' pb='16' mx={1}>
                  <SliderThumbWithTooltip />
                </Box>
              </Section>

              <Section py='4'>
                <Text variant='title' color='black'>
                  Choose Locations To Run From
                </Text>
                <Box pt='5' pb='2'>
                  <Locations />
                </Box>
              </Section>

              <Section py='4' mb='0'>
                <Text variant='title' color='black'>
                  Notifications
                </Text>
                <Box pt='5' pb='2'>
                  <MonitorNotifications />
                </Box>
              </Section>

              <Modal isOpen={isModalOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent borderRadius={16} boxShadow='0px 4px 16px rgba(38, 50, 56, 0.1)'>
                  <ModalHeader pb={2}>
                    <Text color='black' variant='header'>
                      {id ? 'Update' : 'Add'} Monitor
                    </Text>
                  </ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <FormControl id='name' w='200'>
                      <Text variant='details' color='black'>
                        Name
                      </Text>
                      <Input
                        borderRadius={8}
                        color='gray.300'
                        borderColor='gray.200'
                        type='name'
                        autoComplete='name'
                        {...register('name')}
                        placeholder='Add name'
                      />
                    </FormControl>
                  </ModalBody>

                  <ModalFooter>
                    <Button
                      variant='outline'
                      borderRadius={24}
                      border='2px'
                      px='22px'
                      color='darkblue.100'
                      borderColor='darkblue.100'
                      _hover={{ bg: 'transparent' }}
                      mr={3}
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    <PrimaryButton
                      label='Save'
                      disabled={!watched.url || !watched.name}
                      variant='emphasis'
                      color='white'
                      onClick={handleSubmit(handleCreation)}
                    ></PrimaryButton>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </Flex>
          </Box>
        </form>
      </FormProvider>
    </Box>
  )
}
