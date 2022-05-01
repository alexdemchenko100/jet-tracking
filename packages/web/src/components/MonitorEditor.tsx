import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Icon,
  Input,
  Radio,
  RadioGroup,
  Select,
  Slider,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { Monitor, MonitorAssertion, MonitorTuples } from '@httpmon/db'
import React from 'react'
import { FormProvider, useFieldArray, useForm, useFormContext, Controller } from 'react-hook-form'

import { FiChevronsRight, FiPlus, FiTrash2 } from 'react-icons/fi'
import { useMutation, useQuery } from 'react-query'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { MonitorAuthEditor } from './MonitorAuthEditor'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import {
  getRegionsFromShowLocations,
  getShowLocationsFromRegions,
  MonitorLocation,
  syncShowLocationsWithStore,
} from '../services/MonitorLocations'
import { Store } from '../services/Store'
import { frequencyMSToScale, FrequencyScales, scaleToFrequencyMS } from '../services/FrequencyScale'
import { MonitorNotifications } from './MonitorNotifications'

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
            {FrequencyScales.map((scale) => {
              return (
                <SliderMark
                  key={scale.label}
                  value={scale.scaleIndex}
                  mt='1'
                  ml='-2.5'
                  fontSize='sm'
                >
                  {scale.label}
                </SliderMark>
              )
            })}

            <SliderTrack bg={'gray.400'}>{/* <SliderFilledTrack /> */}</SliderTrack>
            <SliderThumb bg={'blue.200'} />
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
        return 'Add Variable'
      default:
        return ''
    }
  }

  return (
    <>
      <Box mt='4'>
        {tuples.map((field, index) => (
          <Flex key={field.id} mb='2'>
            <Input type='text' {...register(`${name}.${index}.0` as const)} placeholder='name' />
            <Input
              type='text'
              ml='4'
              {...register(`${name}.${index}.1` as const)}
              placeholder='value'
            />

            <Button onClick={() => remove(index)}>
              <Icon color='red.500' as={FiTrash2} cursor='pointer' />
            </Button>
          </Flex>
        ))}
      </Box>
      <Button size='lg' variant='ghost' colorScheme='blue' onClick={() => append([['', '']])}>
        <Icon as={FiPlus} cursor='pointer' />
        {nameToLabel(name)}
      </Button>
    </>
  )
}

function BodyInput() {
  const { control } = useFormContext()

  return (
    <Controller
      control={control}
      name='bodyType'
      render={({ field }) => (
        <Flex alignItems='center'>
          <RadioGroup
            size='sm'
            defaultValue=''
            value={field.value}
            onChange={(v) => {
              field.onChange(v)
            }}
          >
            <Stack direction='row'>
              <Radio value=''>None</Radio>
              <Radio value='application/json'>JSON</Radio>
              <Radio value='text/xml'>XML</Radio>
              <Radio value='text/html'>HTML</Radio>
              <Radio value='text/plain'>Text</Radio>
            </Stack>
          </RadioGroup>
        </Flex>
      )}
    />
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
    <Flex alignItems='center'>
      <CheckboxGroup>
        <Stack direction='column'>
          {showLocations.map((locEntry, index) => (
            <Controller
              key={locEntry.id}
              control={control}
              name={`showLocations.${index}.set`}
              render={({ field }) => {
                return (
                  <Checkbox isChecked={field.value} onChange={field.onChange}>
                    {/* //accessing internal representation of RHF */}
                    {(locEntry as any)['name']}
                  </Checkbox>
                )
              }}
            />
          ))}
        </Stack>
      </CheckboxGroup>
    </Flex>
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
    <Grid gap='1'>
      {assertions.map((field, index) => (
        <Flex key={field.id} gap='2'>
          <Select {...register(`assertions.${index}.type`)}>
            <option value='code'>Code</option>
            <option value='totalTime'>Total Time</option>
            <option value='certExpiryDays'>Days to Cert Expiry</option>
            <option value='header'>Header</option>
            <option value='body'>Body</option>
            <option value='jsonBody'>JSON Body</option>
          </Select>

          {showNameField(assertValues[index]) && (
            <Input
              type='text'
              {...register(`assertions.${index}.name` as const)}
              placeholder={placeholder(assertValues[index].type)}
            />
          )}

          <Select defaultValue='=' {...register(`assertions.${index}.op`)}>
            {isStringField(assertValues[index]) && (
              <>
                <option value='contains'>contains</option>
                <option value='matches'>matches (regex)</option>
              </>
            )}
            <option value='='>equal to</option>
            <option value='!='>not equal to</option>
            <option value='>'>greater than</option>
            <option value='<'>less than</option>
          </Select>
          <Input
            type='text'
            {...register(`assertions.${index}.value` as const)}
            placeholder='value'
          />

          <Button onClick={() => remove(index)}>
            <Icon color='red.500' as={FiTrash2} cursor='pointer' />
          </Button>
        </Flex>
      ))}
      <Button onClick={() => append([{ type: '', value: '' }])} maxW='42px'>
        <Icon color='blue.500' as={FiPlus} cursor='pointer' />
      </Button>
    </Grid>
  )
}

interface EditProps {
  handleOndemandMonitor: (mon: Monitor) => void
}

export function MonitorEditor({ handleOndemandMonitor }: EditProps) {
  //id tells apart Edit to a new check creation
  const { id } = useParams()
  const drawer = useDisclosure()

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
      notifications: { failCount: 0 },
      bodyType: '',
      body: '',
    },
  })

  const {
    register,
    control,
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
    <Box mx='2'>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleCreation)}>
          <Box>
            <Flex minH='100vh' justify='start' direction='column'>
              <Flex justify='start' alignItems='end'>
                <FormControl id='method' maxW='28'>
                  <Select color='purple' fontWeight='extrabold' {...register('method')}>
                    <option value='GET'>GET</option>
                    <option value='POST'>POST</option>
                    <option value='PUT'>PUT</option>
                    <option value='PATCH'>PATCH</option>
                    <option value='DELETE'>DELETE</option>
                    <option value='OPTIONS'>OPTIONS</option>
                  </Select>
                </FormControl>

                <FormControl id='url' ml='2'>
                  <Input placeholder='https:// URL here' autoComplete='url' {...register('url')} />
                </FormControl>

                <Button
                  alignSelf='center'
                  variant='solid'
                  mx='1em'
                  size='sm'
                  colorScheme='blue'
                  disabled={watched.url == ''}
                  onClick={() => handleQuickRun()}
                >
                  Run now
                </Button>
              </Flex>

              <Tabs mt='4'>
                <TabList>
                  <Tab>
                    Body
                    {watched.body && watched.body.length > 0 && <sup color='green'>1</sup>}
                  </Tab>
                  <Tab>
                    Headers
                    {numValues('headers') > 0 && (
                      <sup color='green'>&nbsp;{numValues('headers')}</sup>
                    )}
                  </Tab>
                  <Tab>
                    Auth
                    {hasValidAuth() && <sup color='green'>1</sup>}
                  </Tab>
                  <Tab>
                    Query Params
                    {numValues('queryParams') > 0 && (
                      <sup color='green'>&nbsp;{numValues('queryParams')}</sup>
                    )}
                  </Tab>
                  <Tab>
                    Variables
                    {numValues('env') > 0 && <sup color='green'>&nbsp;{numValues('env')}</sup>}
                  </Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <BodyInput />
                    {watched.bodyType && (
                      <Controller
                        control={control}
                        name='body'
                        render={({ field }) => {
                          return (
                            <CodeMirror
                              height='200px'
                              extensions={[javascript({ jsx: true })]}
                              value={field.value}
                              onChange={(value, _viewUpdate) => {
                                field.onChange(value)
                              }}
                            />
                          )
                        }}
                      />
                    )}
                  </TabPanel>
                  <TabPanel>
                    <TupleEditor name='headers' />
                  </TabPanel>
                  <TabPanel>
                    <MonitorAuthEditor />
                  </TabPanel>
                  <TabPanel>
                    <TupleEditor name='queryParams' />
                  </TabPanel>
                  <TabPanel>
                    <TupleEditor name='env' />
                  </TabPanel>
                </TabPanels>
              </Tabs>

              <Heading size='md' color='purple' mt='10' mb='4'>
                <Icon name='info' mr='2' as={FiChevronsRight} />
                Choose Test criteria
              </Heading>
              <Assertions />

              <FormControl id='frequency' maxW='80%'>
                <Heading size='md' color='purple' mt='10' mb='4'>
                  <Icon name='info' mr='2' as={FiChevronsRight} />
                  How Often To Run?
                </Heading>
                <SliderThumbWithTooltip />
              </FormControl>

              <Heading size='md' color='darkmagenta' mt='10' mb='4'>
                <Icon name='info' mr='2' as={FiChevronsRight} />
                Choose Locations To Run From
              </Heading>
              <Locations />

              <Heading size='md' color='darkmagenta' mt='10' mb='4'>
                <Icon name='info' mr='2' as={FiChevronsRight} />
                Notifications
              </Heading>
              <MonitorNotifications />

              <Heading size='md' color='darkmagenta' mt='10' mb='4'>
                <Icon name='info' mr='2' as={FiChevronsRight} />
                Name and Save
              </Heading>

              <Flex mt='2'>
                <FormControl id='name' w='200'>
                  <Flex alignItems='baseline'>
                    <Input
                      type='name'
                      autoComplete='name'
                      {...register('name')}
                      placeholder='Please choose a name'
                    />
                  </Flex>
                </FormControl>

                <Button
                  ml='4'
                  colorScheme='blue'
                  size='md'
                  w='40'
                  variant='solid'
                  disabled={!watched.url || !watched.name}
                  type='submit'
                >
                  {id ? 'Update' : 'Create'}
                </Button>
              </Flex>
            </Flex>
          </Box>
        </form>
      </FormProvider>
    </Box>
  )
}
