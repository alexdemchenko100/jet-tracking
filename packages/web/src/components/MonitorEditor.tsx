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
  Switch,
  FormLabel,
  AccordionPanel,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
} from '@chakra-ui/react'
import {
  AlertSettings,
  MonEnv,
  Monitor,
  MonitorAssertion,
  MonitorTuples,
  NotificationChannel,
  MonitorLocation,
} from '@httpmon/db'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FormProvider, useFieldArray, useForm, useFormContext, Controller } from 'react-hook-form'
import { MultiValue, Select as MultiSelect } from 'chakra-react-select'
import { FiPlus, FiTrash2, FiSearch } from 'react-icons/fi'
import { useMutation, useQuery } from 'react-query'
import axios, { AxiosError } from 'axios'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { MonitorAuthEditor } from './MonitorAuthEditor'
import {
  getRegionsFromShowLocations,
  getShowLocationsFromRegions,
  syncShowLocationsWithStore,
} from '../services/MonitorLocations'
import { Store } from '../services/Store'
import { frequencyMSToScale, FrequencyScales, scaleToFrequencyMS } from '../services/FrequencyScale'
import { MonitorNotifications } from './MonitorNotifications'
import { MonitorBodyEditor } from './MonitorBodyEditor'
import { MonitorTab, Text, PrimaryButton, Section } from '../components'
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
      case 'variables':
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

type FilterOptionType = {
  label: string
  value?: string
}

function Environments() {
  const { setValue, getValues } = useFormContext()
  const [selectedEnvs, setSelectedEnvs] = useState<FilterOptionType[]>([])
  const environments: string[] = getValues('environments')

  const { data: AllEnvs } = useQuery<MonEnv[]>(['monenv'], async () => {
    const resp = await axios({
      method: 'GET',
      url: `/environments`,
    })

    return resp.data as MonEnv[]
  })

  useEffect(() => {
    if (environments && AllEnvs) {
      const validEnvs = AllEnvs?.filter((item: MonEnv) => {
        return environments.find((envId) => envId == item.id)
      })
      console.log(AllEnvs)
      console.log(validEnvs)
      setSelectedEnvs(validEnvs.map((validEnv) => ({ label: validEnv.name, value: validEnv.id })))
    }
  }, [environments, AllEnvs])

  const EnvsOptions = useMemo(
    () =>
      AllEnvs?.filter((env) => env.name != '__global__').map((env) => {
        return {
          label: env.name,
          value: env.id,
        }
      }) || [],
    [AllEnvs]
  )

  const onChange = (value: MultiValue<FilterOptionType>) => {
    setSelectedEnvs(value as FilterOptionType[])
    setValue(
      'environments',
      value.map((i: FilterOptionType) => i.value)
    )
  }

  return (
    <Box maxW='500'>
      <MultiSelect
        isMulti
        value={selectedEnvs}
        onChange={onChange}
        options={EnvsOptions}
        chakraStyles={{
          dropdownIndicator: (provided) => ({
            ...provided,
            bg: 'transparent',
            px: 2,
            cursor: 'inherit',
          }),
          indicatorSeparator: (provided) => ({
            ...provided,
            display: 'none',
          }),
        }}
      />
    </Box>
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
  isVertical: boolean
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

export function MonitorEditor({ handleOndemandMonitor, isVertical }: EditProps) {
  useEffect(() => {
    document.title = 'Monitor Editor | ProAutoma'
  }, [])

  //id tells apart Edit to a new check creation
  const { id } = useParams()
  const toast = useToast()
  const navigate = useNavigate()

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
      variables: [] as MonitorTuples,
      environments: [] as string[],
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
      status: 'active',
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

  const { data: globalAlertSettings } = useQuery<AlertSettings>(
    ['global-alert-settings'],
    async () => {
      const resp = await axios({
        method: 'GET',
        url: '/settings',
      })
      return resp.data ? resp.data.alert : {}
    }
  )

  const { data: notificationChannels } = useQuery<NotificationChannel[]>(
    ['notificaitons'],
    async () => {
      const resp = await axios({
        method: 'GET',
        url: '/settings/notifications',
      })
      const channels = resp.data as NotificationChannel[]
      const defaultEnabledChannels = channels
        .filter((channel) => channel.isDefaultEnabled)
        .map((channel: NotificationChannel) => channel.id || '')
      setValue('notifications.channels', defaultEnabledChannels)
      return channels
    }
  )

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
  } = useMutation<Monitor, AxiosError, Monitor>(async (data: Monitor) => {
    const method = id ? 'POST' : 'PUT'
    const url = id ? `/monitors/${id}` : '/monitors'
    const resp = await axios({
      method,
      url,
      data: {
        ...data,
        notifications: data.notifications?.useGlobal
          ? {
              ...data.notifications,
              failCount: globalAlertSettings?.failCount,
              failTimeMinutes: globalAlertSettings?.failTimeMinutes,
            }
          : data.notifications,
      },
    })
    return resp.data as Monitor
  })

  useEffect(() => {
    if (createError) {
      toast({
        position: 'top',
        title: 'Error',
        description: createError.response?.data.message,
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
    }
  }, [createError])

  const watched = watch()

  function handleQuickRun() {
    handleOndemandMonitor(prepareMonitor(watched))
  }

  function numValues<T extends 'headers' | 'queryParams' | 'variables'>(name: T) {
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

    if (monitor.variables && monitor.variables.length > 0) {
      monitor.variables = monitor.variables.filter((item) => item[0])
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
    let hasErrors, errorMessage
    if (!data.url) {
      hasErrors = true
      errorMessage = 'URL is required.'
    }
    if (!data.name) {
      hasErrors = true
      errorMessage = 'Name is required.'
    }
    if (hasErrors) {
      toast({
        position: 'top',
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
      return
    }
    const monitor = prepareMonitor(data)
    const updating = Boolean(monitor.id)
    const monResp = await createMonitor({
      ...monitor,
      status: monitor.status === 'active' ? 'active' : 'paused',
    })

    if (monResp.id) {
      Store.queryClient?.invalidateQueries(['monitors-list'])
      Store.queryClient?.invalidateQueries(['monitors-stats'])
      toast({
        position: 'top',
        title: 'Monitor ' + updating ? 'updated.' : 'created',
        description: 'Your monitor is ready now!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
      navigate('/console/monitors')
    }
  }

  return (
    <>
      <Section>
        <Flex alignItems='center' justify={'space-between'}>
          <Input
            borderRadius={8}
            color='darkgray.100'
            borderColor={id ? 'transparent' : 'gray.300'}
            fontSize='24'
            fontWeight='bold'
            type='name'
            px='2'
            py='1'
            {...register('name')}
            placeholder='Monitor Name'
            maxW='96'
          />
          <Flex>
            <FormControl display='flex' alignItems='center' mr={{ base: 0, lg: 6 }}>
              <FormLabel mb='0'>
                <Text variant='text-field' color='gray.300'>
                  {watched.status === 'active' ? 'Active' : 'Paused'}
                </Text>
              </FormLabel>
              <Switch
                size='lg'
                value='active'
                isChecked={watched.status === 'active'}
                {...register('status')}
                colorScheme='cyan'
              />
            </FormControl>
            <PrimaryButton
              label='Save'
              variant='emphasis'
              color={'white'}
              onClick={handleSubmit(handleCreation)}
            ></PrimaryButton>
          </Flex>
        </Flex>
      </Section>
      <Box>
        <FormProvider {...methods}>
          <form>
            <Box>
              <Flex minH={isVertical ? 'unset' : '100vh'} justify='start' direction='column'>
                <Section paddingTop='29px' paddingBottom='10px'>
                  <Flex justify='space-between' alignItems='center' gap={2}>
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
                      padding={'14px 16px 15px'}
                    ></PrimaryButton>
                  </Flex>

                  <Accordion allowToggle>
                    <AccordionItem border='none' py={5}>
                      <AccordionButton bg='transparent' p='0' _hover={{ bg: 'transparent' }}>
                        <AccordionIcon />
                        <Text variant='text-field' color='darkgray.100'>
                          Advanced
                        </Text>
                      </AccordionButton>
                      <AccordionPanel pb={4}>
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
                              {numValues('variables') > 0 && (
                                <sup color='green'>&nbsp;{numValues('variables')}</sup>
                              )}
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
                              <TupleEditor name='variables' />
                            </TabPanel>
                          </TabPanels>
                        </Tabs>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </Section>

                <Section py='4'>
                  <Text variant='title' color='black'>
                    Environment
                  </Text>
                  <Box pt='5' pb='2'>
                    <Environments />
                  </Box>
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
                    <MonitorNotifications notificationChannels={notificationChannels} />
                  </Box>
                </Section>
              </Flex>
            </Box>
          </form>
        </FormProvider>
      </Box>
    </>
  )
}
