import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
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
  Textarea,
} from '@chakra-ui/react'
import { Monitor, MonitorTuples } from '@httpmon/db'
import React from 'react'
import { FormProvider, useFieldArray, useForm, useFormContext, Controller } from 'react-hook-form'

import { FiPlusCircle, FiTrash2 } from 'react-icons/fi'
import { useState } from 'react'
import { APIOnDemandResult } from './APIResult'
import { useMutation, useQuery } from 'react-query'
import axios from 'axios'
import { useLocation, useParams } from 'react-router-dom'

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

function APIHeaders(props: any) {
  const { control, register } = useFormContext()
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
      <Flex mt='4' alignItems='center'>
        <Heading size='sm'>Headers</Heading>
        <Button onClick={() => append([['', '']])}>
          <Icon color='blue.500' as={FiPlusCircle} cursor='pointer' />
        </Button>
      </Flex>

      <Box mt='4'>
        {headers.map((header, index) => (
          <Flex key={index} mb='2'>
            <Input type='text' {...register(`headers.${index}.0` as const)} defaultValue={''} />
            <Input
              type='text'
              ml='4'
              {...register(`headers.${index}.1` as const)}
              defaultValue=''
            />

            <Button onClick={() => remove(index)}>
              <Icon color='red.500' as={FiTrash2} cursor='pointer' />
            </Button>
          </Flex>
        ))}
      </Box>
    </>
  )
}

function QueryParams(props: any) {
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
      <Flex mt='4' alignItems='center'>
        <Heading size='sm'>Query Params</Heading>
        <Button onClick={() => append([['', '']])}>
          <Icon color='blue.500' as={FiPlusCircle} cursor='pointer' />
        </Button>
      </Flex>

      <Box mt='4'>
        {queryParams.map((_, index) => (
          <Flex key={index} mb='2'>
            <Input type='text' {...register(`queryParams.${index}.0` as const)} defaultValue={''} />
            <Input
              type='text'
              ml='4'
              {...register(`queryParams.${index}.1` as const)}
              defaultValue={''}
            />

            <Button onClick={() => remove(index)}>
              <Icon color='red.500' as={FiTrash2} cursor='pointer' />
            </Button>
          </Flex>
        ))}
      </Box>
    </>
  )
}

function EnvVariables(props: any) {
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
      <Flex mt='4' alignItems='center'>
        <Heading size='sm'>Environment</Heading>
        <Button onClick={() => append([['', '']])}>
          <Icon color='blue.500' as={FiPlusCircle} cursor='pointer' />
        </Button>
      </Flex>

      <Box mt='4'>
        {env.map((_, index) => (
          <Flex key={index} mb='2'>
            <Input type='text' {...register(`env.${index}.0` as const)} defaultValue={''} />
            <Input type='text' ml='4' {...register(`env.${index}.1` as const)} defaultValue={''} />

            <Button onClick={() => remove(index)}>
              <Icon color='red.500' as={FiTrash2} cursor='pointer' />
            </Button>
          </Flex>
        ))}
      </Box>
    </>
  )
}

function BodyInput(props: any) {
  const { control, register } = useFormContext()

  return (
    <>
      <Flex mt='4' alignItems='center'>
        <Heading size='sm' mr='4'>
          Body
        </Heading>
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

export function MonitorEditor() {
  //id tells apart Edit to a new check creation
  const { id } = useParams()

  interface FormMonitor extends Monitor {
    frequencyScale: number
  }

  const methods = useForm<FormMonitor>({
    defaultValues: {
      headers: [] as MonitorTuples,
      frequencyScale: 0,
    },
  })

  const {
    register,
    reset,
    watch,
    handleSubmit,
    formState: { errors },
  } = methods

  const {
    isLoading,
    data: loadedMonitor,
    error: loadError,
  } = useQuery<Monitor>(
    id || 'load',
    async () => {
      const resp = await axios({
        method: 'GET',
        url: `/monitors/${id}`,
      })
      reset(resp.data)
      return resp.data as Monitor
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

  async function handleCreation(data: FormMonitor) {
    data.frequency = freqConfig[data.frequencyScale][0]
    const { frequencyScale, ...monitor } = data //remove scale

    await createMonitor(monitor)
  }

  return (
    <Flex>
      <Box w={ondemandMonitor ? '50%' : '100%'}>
        <Heading size='md' mb='10'>
          {id ? `Update Monitor` : 'Create new API monitor'}
        </Heading>

        <Divider />
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleCreation)}>
            <Box>
              <Flex minH='100vh' justify='start' direction='column'>
                <FormControl id='name'>
                  <FormLabel htmlFor='name'>Name</FormLabel>
                  <Input type='name' {...register('name')} />
                </FormControl>

                <EnvVariables />

                <Flex justify='start' alignItems='end' mt='4'>
                  <FormControl id='method' maxW='32'>
                    <FormLabel htmlFor='method'>Method</FormLabel>
                    <Select color='blue.500' fontWeight='bold' {...register('method')}>
                      <option defaultValue='GET' value='GET'>
                        GET
                      </option>
                      <option value='POST'>POST</option>
                      <option value='OPTIONS'>OPTIONS</option>
                    </Select>
                  </FormControl>

                  <FormControl id='url' ml='2'>
                    <FormLabel htmlFor='url'>URL</FormLabel>
                    <Input
                      // type="url"
                      placeholder='url here'
                      {...register('url')}
                    />
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

                <BodyInput />
                {watched.bodyType != '' && (
                  <Textarea mt='4' h='36' {...register('body')}></Textarea>
                )}
                <APIHeaders />
                <QueryParams />

                <FormControl id='frequency' mt='10' maxW='80%'>
                  <FormLabel htmlFor='frequency'>Frequency</FormLabel>
                  <SliderThumbWithTooltip />
                </FormControl>

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
          <APIOnDemandResult monitor={ondemandMonitor} />
        </Box>
      )}
    </Flex>
  )
}
