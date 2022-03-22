import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
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
} from '@chakra-ui/react'
import { Monitor, MonitorAssertion, MonitorTuples } from '@httpmon/db'
import React from 'react'
import { FormProvider, useFieldArray, useForm, useFormContext, Controller } from 'react-hook-form'

import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { APIResultByDemand } from './APIResultByDemand'

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

            {/* <Tooltip
        hasArrow
        bg="teal.500"
        color="white"
        placement="top"
        isOpen={showTooltip}
        label={`${sliderValue}m`}
      >
        <SliderThumb />
      </Tooltip> */}
          </Slider>
        )
      }}
    />
  )
}

function APIHeaders() {
  const { control, register } = useFormContext<Monitor>()
  const {
    fields: headers,
    append,
    remove,
  } = useFieldArray({
    name: 'headers',
    control,
  })

  return (
    <>
      <Flex alignItems='start'>
        <Heading size='xs'>HTTP Headers</Heading>
      </Flex>

      <Box mt='4'>
        {headers.map((field, index) => (
          <Flex key={field.id} mb='2'>
            <Input type='text' {...register(`headers.${index}.0` as const)} placeholder='name' />
            <Input
              type='text'
              ml='4'
              {...register(`headers.${index}.1` as const)}
              placeholder='value'
            />

            <Button onClick={() => remove(index)}>
              <Icon color='red.500' as={FiTrash2} cursor='pointer' />
            </Button>
          </Flex>
        ))}
        <Button onClick={() => append([['', '']])}>
          <Icon color='blue.500' as={FiPlus} cursor='pointer' />
        </Button>
      </Box>
    </>
  )
}

function QueryParams() {
  const { control, register } = useFormContext()
  const {
    fields: queryParams,
    append,
    remove,
  } = useFieldArray({
    name: 'queryParams',
    control,
  })

  return (
    <>
      <Flex alignItems='center'>
        <Heading size='xs'>Query Params</Heading>
      </Flex>

      <Box mt='4'>
        {queryParams.map((field, index) => (
          <Flex key={field.id} mb='2'>
            <Input type='text' {...register(`queryParams.${index}.0` as const)} placeholder='key' />
            <Input
              type='text'
              ml='4'
              {...register(`queryParams.${index}.1` as const)}
              placeholder='value'
            />

            <Button onClick={() => remove(index)}>
              <Icon color='red.500' as={FiTrash2} cursor='pointer' />
            </Button>
          </Flex>
        ))}
      </Box>
      <Button onClick={() => append([['', '']])}>
        <Icon color='blue.500' as={FiPlus} cursor='pointer' />
      </Button>
    </>
  )
}

function EnvVariables() {
  const { control, register } = useFormContext()
  const {
    fields: env,
    append,
    remove,
  } = useFieldArray({
    name: 'env',
    control,
  })

  return (
    <>
      <Flex alignItems='center'>
        <Heading size='xs'>Variables</Heading>
      </Flex>

      <Box mt='4'>
        {env.map((field, index) => (
          <Flex key={field.id} mb='2'>
            <Input type='text' {...register(`env.${index}.0` as const)} placeholder='name' />
            <Input
              type='text'
              ml='4'
              {...register(`env.${index}.1` as const)}
              placeholder='value'
            />

            <Button onClick={() => remove(index)}>
              <Icon color='red.500' as={FiTrash2} cursor='pointer' />
            </Button>
          </Flex>
        ))}
      </Box>
      <Button onClick={() => append([['', '']])}>
        <Icon color='blue.500' as={FiPlus} cursor='pointer' />
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
                name={`showLocations.${index}.1`}
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

export function MonitorEditor() {
  //id tells apart Edit to a new check creation
  const { id } = useParams()

  interface FormMonitor extends Monitor {
    frequencyScale: number
    showLocations: [string, boolean][]
  }

  function toShowLocations(locations?: string[]) {
    //reset defaultValues to false so server data overrides them
    let showLocations = [...defaultShowLocations]
    for (let i = 0; i < showLocations.length; i++) {
      showLocations[i][1] = false
    }

    //now, update local values to be same as server
    if (Array.isArray(locations)) {
      locations.forEach((loc) => {
        for (let i = 0; i < showLocations.length; i++) {
          if (showLocations[i][0] == loc) showLocations[i][1] = true
        }
      })
    }
    return showLocations
  }

  function fromShowLocations(showLoc: [string, boolean][]) {
    let locations: string[] = []
    showLoc.forEach(([loc, valid]) => {
      if (valid) locations.push(loc)
    })
    return locations
  }

  const defaultShowLocations: [string, boolean][] = [
    ['US-East', true],
    ['Europe-West', false],
    ['Asia-Singapore', false],
  ]

  const methods = useForm<FormMonitor>({
    defaultValues: {
      headers: [] as MonitorTuples,
      queryParams: [] as MonitorTuples,
      env: [] as MonitorTuples,
      assertions: [{ type: 'code', op: '=', value: '200' }] as MonitorAssertion[],
      frequencyScale: 0,
      showLocations: defaultShowLocations,
    },
  })

  const {
    register,
    reset,
    watch,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
  } = methods

  const { isLoading, error: loadError } = useQuery<FormMonitor>(
    id || 'load',
    async () => {
      const resp = await axios({
        method: 'GET',
        url: `/monitors/${id}`,
      })
      //reset the form data directly
      const formMon = { ...resp.data, showLocations: toShowLocations(resp.data.locations) }
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

  const [ondemandMonitor, setOndemandMonitor] = useState<Monitor>()

  const watched = watch()
  console.log(watched)

  function handleQuickRun() {
    setOndemandMonitor({ ...watched })
  }

  function numValues<T extends 'headers' | 'queryParams' | 'env'>(name: T) {
    const values = getValues(name)

    if (values && values.length > 0) {
      return values.filter((item) => Boolean(item[0])).length
    }
    return 0
  }

  async function handleCreation(data: FormMonitor) {
    //cleanse data to become the monitor
    data.frequency = freqConfig[data.frequencyScale][0]
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

    await createMonitor(monitor)
  }

  return (
    <Flex>
      <Box w={ondemandMonitor ? '50%' : '100%'}>
        <Heading size='md' mb='10'>
          {id ? `Editing Monitor` : 'Create new API monitor'}
        </Heading>

        <Divider />
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleCreation)}>
            <Box>
              <Flex minH='100vh' justify='start' direction='column'>
                <FormControl id='name'>
                  <Flex alignItems='baseline'>
                    <FormLabel htmlFor='name'>Name</FormLabel>
                    <Input type='name' {...register('name')} />
                  </Flex>
                </FormControl>

                <Flex justify='start' alignItems='end' mt='4'>
                  <FormControl id='method' maxW='32'>
                    <Select color='blue.500' fontWeight='bold' {...register('method')}>
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
                    bg='blue.400'
                    color='white'
                    _hover={{
                      bg: 'blue.500',
                    }}
                    ml='4'
                    onClick={() => handleQuickRun()}
                  >
                    Run now
                  </Button>
                </Flex>

                <Tabs mt='4'>
                  <TabList>
                    <Tab>
                      Headers
                      {numValues('headers') > 0 && (
                        <sup color='green'>&nbsp;{numValues('headers')}</sup>
                      )}
                    </Tab>
                    <Tab>Body</Tab>
                    <Tab>Auth</Tab>
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
                      <APIHeaders />
                    </TabPanel>
                    <TabPanel>
                      <BodyInput />
                      {watched.bodyType != '' && (
                        <Textarea mt='4' h='36' {...register('body')}></Textarea>
                      )}
                    </TabPanel>
                    <TabPanel>
                      <p>Auth</p>
                    </TabPanel>
                    <TabPanel>
                      <QueryParams />
                    </TabPanel>
                    <TabPanel>
                      <EnvVariables />
                    </TabPanel>
                  </TabPanels>
                </Tabs>

                <FormControl id='frequency' mt='10' maxW='80%'>
                  <Heading size='sm' mt='10' mb='4'>
                    How often to run the monitor?
                  </Heading>
                  <SliderThumbWithTooltip />
                </FormControl>

                <Heading size='sm' mt='10' mb='4'>
                  Choose where to run the monitor from
                </Heading>
                <Locations />

                <Heading size='sm' mt='10' mb='4'>
                  Choose criterial for success
                </Heading>
                <Assertions />

                <Button
                  bg='blue.300'
                  color='white'
                  _hover={{
                    bg: 'blue.400',
                  }}
                  mt='10'
                  w='40'
                  type='submit'
                >
                  {id ? 'Update' : 'Create'}
                </Button>
              </Flex>
            </Box>
          </form>
        </FormProvider>
      </Box>
      {ondemandMonitor && (
        <Box w='50%' ml='10'>
          <APIResultByDemand onDemandMonitor={ondemandMonitor} />
        </Box>
      )}
    </Flex>
  )
}
