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
  Textarea,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { Monitor, MonitorAssertion, MonitorTuples } from '@httpmon/db'
import React from 'react'
import { FormProvider, useFieldArray, useForm, useFormContext, Controller } from 'react-hook-form'

import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { useMutation, useQuery } from 'react-query'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { MonitorAuthEditor } from './MonitorAuthEditor'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'

const freqConfig: [numSeconds: number, label: string][] = [
  [10, '10s'],
  [60, '1m'],
  [60 * 5, '5m'],
  [60 * 10, '10m'],
  [60 * 15, '15m'],
  [60 * 30, '30m'],
  [60 * 60, '1h'],
  [60 * 60 * 12, '12h'],
  [60 * 60 * 24, '24h'],
]

function frequencyToScale(freq: number) {
  for (let i = 0; i < freqConfig.length; i++) {
    if (freqConfig[i][0] == freq) return i
  }
  return 0
}

function scaleToFrequency(scale: number) {
  if (scale < freqConfig.length) return freqConfig[scale][0]
  return 0
}

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
            max={freqConfig.length - 1}
            step={1}
            value={field.value}
            onChange={(v) => {
              field.onChange(v)
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {freqConfig.map(([numSeconds, label], scale) => {
              return (
                <SliderMark key={label} value={scale} mt='1' ml='-2.5' fontSize='sm'>
                  {label}
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
      <Button variant='ghost' colorScheme='blue' onClick={() => append([['', '']])}>
        <Icon as={FiPlus} cursor='pointer' />
        {nameToLabel(name)}
      </Button>
    </>
  )
}

function BodyInput() {
  const { control, register } = useFormContext()

  return (
    <>
      <Flex alignItems='center'>
        <RadioGroup>
          <Stack direction='row'>
            <Radio value='' defaultChecked {...register('bodyType')}>
              none
            </Radio>
            <Radio value='application/json' {...register('bodyType')}>
              application/json
            </Radio>
            <Radio value='text/html' {...register('bodyType')}>
              text/html
            </Radio>
          </Stack>
        </RadioGroup>
      </Flex>
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
    <>
      <Flex alignItems='center'>
        <CheckboxGroup>
          <Stack direction='row'>
            {showLocations.map((locEntry, index) => (
              <Controller
                key={locEntry.id}
                control={control}
                name={`showLocations.${index}.2`}
                render={({ field }) => {
                  return (
                    <Checkbox isChecked={field.value} onChange={field.onChange}>
                      {/* //accessing internal representation of RHF */}
                      {(locEntry as any)['0']}
                    </Checkbox>
                  )
                }}
              />
            ))}
          </Stack>
        </CheckboxGroup>
      </Flex>
    </>
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
              <option value='='>equals to</option>
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
    </>
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
    showLocations: [string, string, boolean][]
  }

  function toShowLocations(locations?: string[]) {
    //reset defaultValues to false so server data overrides them
    let showLocations = [...defaultShowLocations]
    for (let i = 0; i < showLocations.length; i++) {
      showLocations[i][2] = false
    }

    //now, update local values to be same as server
    if (Array.isArray(locations)) {
      locations.forEach((loc) => {
        for (let i = 0; i < showLocations.length; i++) {
          if (showLocations[i][1] == loc) showLocations[i][2] = true
        }
      })
    }
    return showLocations
  }

  function fromShowLocations(showLoc: [string, string, boolean][]) {
    let locations: string[] = []
    showLoc.forEach(([_label, loc, valid]) => {
      if (valid) locations.push(loc)
    })
    return locations
  }

  const defaultShowLocations: [string, string, boolean][] = [
    ['US-East', 'us-east', true],
    ['Europe-West', 'europe-west', false],
    ['Asia-Singapore', 'asia-singapore', false],
  ]

  const methods = useForm<FormMonitor>({
    defaultValues: {
      headers: [] as MonitorTuples,
      queryParams: [] as MonitorTuples,
      env: [] as MonitorTuples,
      assertions: [{ type: 'code', op: '=', value: '200' }] as MonitorAssertion[],
      frequencyScale: 0,
      showLocations: defaultShowLocations,
      auth: {},
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
      formMon.frequencyScale = frequencyToScale(formMon.frequency)
      formMon.showLocations = toShowLocations(resp.data.locations)

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
    data.frequency = scaleToFrequency(data.frequencyScale)
    data.locations = fromShowLocations(data.showLocations)

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
                  <Select color='blue.500' fontWeight='extrabold' {...register('method')}>
                    <option defaultValue='GET' value='GET'>
                      GET
                    </option>
                    <option value='POST'>POST</option>
                    <option value='OPTIONS'>OPTIONS</option>
                  </Select>
                </FormControl>

                <FormControl id='url' ml='2'>
                  <Input placeholder='https:// url here' {...register('url')} />
                </FormControl>

                <Button
                  colorScheme='green'
                  variant='solid'
                  ml='4'
                  size='sm'
                  disabled={watched.url == ''}
                  onClick={() => handleQuickRun()}
                >
                  Send
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
                    {watched.bodyType != '' && (
                      <Controller
                        control={control}
                        name='body'
                        render={({ field }) => {
                          return (
                            <CodeMirror
                              height='200px'
                              extensions={[javascript({ jsx: true })]}
                              onChange={(value, viewUpdate) => {
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

              <Heading size='sm' mt='10' mb='4'>
                Choose Test Criteria
              </Heading>
              <Assertions />

              <FormControl id='frequency' maxW='80%'>
                <Heading size='sm' mt='10' mb='4'>
                  How Often To Run The Monitor?
                </Heading>
                <SliderThumbWithTooltip />
              </FormControl>

              <Heading size='sm' mt='10' mb='4'>
                Choose Locations to Run The Monitor
              </Heading>
              <Locations />

              <FormControl id='name' mt='4'>
                <Flex alignItems='baseline'>
                  <FormLabel htmlFor='name'>Name</FormLabel>
                  <Input type='name' {...register('name')} />
                </Flex>
              </FormControl>

              <Button
                colorScheme='blue'
                mt='10'
                size='md'
                w='40'
                variant='solid'
                disabled={!watched.url || !watched.name}
                type='submit'
              >
                {id ? 'Update' : 'Create'}
              </Button>
            </Flex>
          </Box>
        </form>
      </FormProvider>
    </Box>
  )
}
