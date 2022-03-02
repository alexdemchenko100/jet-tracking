import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Icon,
  Input,
  Radio,
  RadioGroup,
  Select,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Stack,
  Textarea,
  Tooltip,
} from '@chakra-ui/react'
import { Monitor, MonitorTuples } from '@httpmon/db'
import React from 'react'
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { FiPlusCircle, FiDelete, FiTrash, FiTrash2 } from 'react-icons/fi'

function SliderThumbWithTooltip() {
  const [sliderValue, setSliderValue] = React.useState(1)
  const [showTooltip, setShowTooltip] = React.useState(false)
  return (
    <Slider
      id="slider"
      defaultValue={0}
      min={0}
      max={7}
      step={1}
      // colorScheme="teal"
      onChange={(v) => setSliderValue(v)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <SliderMark value={0} mt="1" ml="-2.5" fontSize="sm">
        1m
      </SliderMark>
      <SliderMark value={1} mt="1" ml="-2.5" fontSize="sm">
        5m
      </SliderMark>
      <SliderMark value={2} mt="1" ml="-2.5" fontSize="sm">
        10m
      </SliderMark>
      <SliderMark value={3} mt="1" ml="-2.5" fontSize="sm">
        15m
      </SliderMark>
      <SliderMark value={4} mt="1" ml="-2.5" fontSize="sm">
        30m
      </SliderMark>
      <SliderMark value={5} mt="1" ml="-2.5" fontSize="sm">
        1h
      </SliderMark>
      <SliderMark value={6} mt="1" ml="-2.5" fontSize="sm">
        12h
      </SliderMark>
      <SliderMark value={7} mt="1" ml="-2.5" fontSize="sm">
        24h
      </SliderMark>

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
      <Flex mt={'4'} alignItems={'center'}>
        <Heading size={'sm'}>Headers</Heading>
        <Button onClick={() => append([['', '']])}>
          <Icon color="blue.500" as={FiPlusCircle} cursor="pointer" />
        </Button>
      </Flex>

      <Box mt={'4'}>
        {headers.map((header, index) => (
          <Flex key={index} mb={'2'}>
            <Input
              type={'text'}
              {...register(`headers.${index}.0` as const)}
              defaultValue={''}
            />
            <Input
              type={'text'}
              ml={'4'}
              {...register(`headers.${index}.1` as const)}
              defaultValue={''}
            />

            <Button onClick={() => remove(index)}>
              <Icon color="red.500" as={FiTrash2} cursor="pointer" />
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
      <Flex mt={'4'} alignItems={'center'}>
        <Heading size={'sm'}>Query Params</Heading>
        <Button onClick={() => append([['', '']])}>
          <Icon color="blue.500" as={FiPlusCircle} cursor="pointer" />
        </Button>
      </Flex>

      <Box mt={'4'}>
        {queryParams.map((_, index) => (
          <Flex key={index} mb={'2'}>
            <Input
              type={'text'}
              {...register(`queryParams.${index}.0` as const)}
              defaultValue={''}
            />
            <Input
              type={'text'}
              ml={'4'}
              {...register(`queryParams.${index}.1` as const)}
              defaultValue={''}
            />

            <Button onClick={() => remove(index)}>
              <Icon color="red.500" as={FiTrash2} cursor="pointer" />
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
      <Flex mt={'4'} alignItems={'center'}>
        <Heading size={'sm'} mr={'4'}>
          Body
        </Heading>
        <RadioGroup>
          <Stack direction="row">
            <Radio value="" defaultChecked {...register('bodyType')}>
              none
            </Radio>
            <Radio value="application/json" {...register('bodyType')}>
              application/json
            </Radio>
            <Radio value="text/html" {...register('bodyType')}>
              text/html
            </Radio>
          </Stack>
        </RadioGroup>
      </Flex>
    </>
  )
}

export function NewAPI() {
  const navigate = useNavigate()

  const methods = useForm<Monitor>({
    defaultValues: {
      headers: [['xxx', 'hello']] as MonitorTuples,
    },
  })

  const {
    register,
    watch,
    formState: { errors },
  } = methods

  const watched = watch()
  console.log(watched)

  function handleQuickRun() {
    navigate('/console/api-result', {
      state: { monitor: { ...watched } },
    })
  }

  return (
    <>
      <Heading size={'lg'} mb={'10'}>
        Create new API monitor
      </Heading>
      <Divider />
      <FormProvider {...methods}>
        <form>
          <Box>
            <Flex minH={'100vh'} justify={'start'} direction={'column'}>
              <FormControl id="name">
                <FormLabel htmlFor="name">Name</FormLabel>
                <Input type="name" placeholder="" />
              </FormControl>

              <Flex justify={'start'} alignItems={'end'} mt={'4'}>
                <FormControl id="method" maxW={'32'}>
                  <FormLabel htmlFor="method">Method</FormLabel>
                  <Select
                    color={'blue.500'}
                    fontWeight={'bold'}
                    {...register('method')}
                  >
                    <option defaultValue={'GET'} value="GET">
                      GET
                    </option>
                    <option value="POST">POST</option>
                    <option value="OPTIONS">OPTIONS</option>
                  </Select>
                </FormControl>

                <FormControl id="url" ml={'2'}>
                  <FormLabel htmlFor="url">URL</FormLabel>
                  <Input
                    type="url"
                    placeholder="url here"
                    {...register('url')}
                  />
                </FormControl>

                <Button
                  bg={'blue.400'}
                  color={'white'}
                  _hover={{
                    bg: 'blue.500',
                  }}
                  ml={'4'}
                  onClick={() => handleQuickRun()}
                >
                  Run now
                </Button>
              </Flex>

              <BodyInput />
              {watched.bodyType != '' && (
                <Textarea mt={'4'} h={'36'} {...register('body')}></Textarea>
              )}
              <APIHeaders />
              <QueryParams />

              <FormControl id="frequency" mt={'10'} maxW={'80%'}>
                <FormLabel htmlFor="frequency">Frequency</FormLabel>
                <SliderThumbWithTooltip />
              </FormControl>

              <Button
                bg={'blue.400'}
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}
                mt={'10'}
                w={'40'}
              >
                Create API Monitor
              </Button>
            </Flex>
          </Box>
        </form>
      </FormProvider>
    </>
  )
}
