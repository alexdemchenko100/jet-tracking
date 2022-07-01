import {
  Input,
  Tabs,
  TabList,
  Tab,
  TabProps,
  TabPanels,
  TabPanel,
  FormControl,
  Flex,
} from '@chakra-ui/react'
import { useFormContext, useFieldArray, Controller } from 'react-hook-form'

function BasicAuth() {
  const { register } = useFormContext()

  return (
    <Flex align='center'>
      <Input borderRadius={8} color='gray.300' borderColor='gray.200' type='name' {...register('auth.basic.username')} placeholder='Username' />
      <Input borderRadius={8} color='gray.300' borderColor='gray.200' ml='2' type='password' autoComplete='off' {...register('auth.basic.password')}  placeholder='Password' />
    </Flex>
  )
}

const AuthTab: React.FC<TabProps> = ({children}) => {
  return (
    <Tab
      fontWeight='600'
      color='gray.300'
      bg='lightgray.100'
      fontSize='md'
      lineHeight='shorter'
      borderRadius='3xl'
      py='2'
      px='4'
      mr='4'
      _selected={{ bg: 'lightblue.200', color: 'white' }}
    >
      {children}
    </Tab>
  )
}

function BearerAuth() {
  const { register } = useFormContext()

  return (
    <FormControl>
      <Input borderRadius={8} color='gray.300' borderColor='gray.200' type='name' {...register('auth.bearer.token')} placeholder='Token' />
    </FormControl>
  )
}

export function MonitorAuthEditor() {
  const { control } = useFormContext()

  const authTypeToIndex = (authType: string) => {
    switch (authType) {
      case 'basic':
        return 1
      case 'bearer':
        return 2
      default:
        return 0
    }
  }

  const indexToAuthType = (index: number) => {
    switch (index) {
      case 1:
        return 'basic'
      case 2:
        return 'bearer'
      default:
        return 'none'
    }
  }

  return (
    <Controller
      control={control}
      name='auth.type'
      render={({ field }) => {
        return (
          <Tabs
            variant='soft-rounded'
            size='sm'
            defaultIndex={authTypeToIndex(field.value)}
            index={authTypeToIndex(field.value)}
            onChange={(index) => {
              field.onChange(indexToAuthType(index))
            }}
          >
            <TabList>
              <AuthTab>None</AuthTab>
              <AuthTab>Basic Auth</AuthTab>
              <AuthTab>Bearer Auth</AuthTab>
            </TabList>

            <TabPanels>
              <TabPanel />
              <TabPanel py='6' px='0'>
                <BasicAuth />
              </TabPanel>
              <TabPanel py='6' px='0'>
                <BearerAuth />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )
      }}
    />
  )
}
