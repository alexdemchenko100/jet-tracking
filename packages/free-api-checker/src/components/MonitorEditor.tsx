import {
  Box,
  Button,
  Flex,
  FormControl,
  Grid,
  Icon,
  Input,
  Select,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  InputGroup,
  InputLeftElement,
  MenuButton,
  Menu,
  IconButton,
  MenuList,
  MenuItem,
  CheckboxGroup,
  Stack,
  Checkbox,
} from '@chakra-ui/react'
import { Monitor, MonitorAssertion, MonitorTuples, MonitorLocation } from '@httpmon/db'
import React, { useEffect, useRef } from 'react'
import { Controller, FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { FiPlus, FiTrash2, FiSearch } from 'react-icons/fi'
import { FaAddressCard } from 'react-icons/fa'
import { useSearchParams } from 'react-router-dom'
import { MonitorAuthEditor } from './MonitorAuthEditor'
import {
  getRegionsFromShowLocations,
  syncShowLocationsWithStore,
} from '../services/MonitorLocations'
import { Store } from '../services/Store'
import { MonitorBodyEditor } from './MonitorBodyEditor'
import { MonitorTab, Text, PrimaryButton, Section } from '.'
import { MonitorPreScriptEditor } from './MonitorPreScriptEditor'
import { setValues } from 'framer-motion/types/render/utils/setters'

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

function Locations() {
  const { control } = useFormContext()
  const { fields: showLocations } = useFieldArray({
    name: 'showLocations',
  })

  return (
    <CheckboxGroup>
      <Stack direction='column'>
        {showLocations.map((locEntry, index) => (
          <MenuItem key={locEntry.id}>
            <Controller
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
          </MenuItem>
        ))}
      </Stack>
    </CheckboxGroup>
  )
}

export function MonitorEditor({ handleOndemandMonitor, isVertical }: EditProps) {
  useEffect(() => {
    document.title = 'Monitor Editor | ProAutoma'
  }, [])

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
      assertions: [] as MonitorAssertion[],
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

  const { register, watch, getValues } = methods

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
    data.locations = getRegionsFromShowLocations(data.showLocations)
    syncShowLocationsWithStore(data.showLocations)
    Store.UIState.editor.frequencyScale = data.frequencyScale

    let { showLocations, ...monitor } = data //remove scale

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

  return (
    <>
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
                            color='gray.300'
                            placeholder='https://'
                            type='url'
                            {...register('url')}
                          />
                        </InputGroup>
                      </FormControl>
                      <Menu closeOnSelect={false}>
                        <MenuButton
                          as={IconButton}
                          aria-label='Options'
                          icon={<FaAddressCard />}
                          variant='outline'
                          border={0}
                          w={7}
                          h={7}
                          mr={1}
                        />
                        <MenuList>
                          <Locations />
                        </MenuList>
                      </Menu>
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

                  <Tabs mt='4'>
                    <TabList borderBottomColor='lightgray.100'>
                      <MonitorTab>
                        Headers
                        {numValues('headers') > 0 && (
                          <sup color='green'>&nbsp;{numValues('headers')}</sup>
                        )}
                      </MonitorTab>
                      <MonitorTab>
                        Body
                        {hasValidBody() && <sup color='green'>1</sup>}
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
                        <TupleEditor name='headers' />
                      </TabPanel>
                      <TabPanel px='0' pt='6' pb='0'>
                        <MonitorBodyEditor />
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
                </Section>

                <Section py='4'>
                  <Text variant='title' color='black'>
                    Choose Test criteria
                  </Text>
                  <Box pt='2' pb='0'>
                    <Assertions />
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
