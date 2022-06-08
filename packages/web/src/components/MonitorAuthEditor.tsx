import {
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
import InputForm from './InputForm'

function BasicAuth() {
  const { register } = useFormContext()

  return (
    <Flex align='center'>
      <InputForm type='name' {...register('auth.basic.username')} placeholder='Username' />
      <InputForm ml='2' type='password' autoComplete='off' {...register('auth.basic.password')}  placeholder='Password' />
    </Flex>
  )
}

const AuthTab: React.FC<TabProps> = ({children}) => {
  return (
    <Tab
      fontWeight='600'
      color='gray.100'
      bg='lightgray.100'
      fontSize='md'
      lineHeight='shorter'
      borderRadius='3xl'
      py='2'
      px='4'
      mr='4'
      _selected={{ bg: 'lightblue.100', color: 'white' }}
    >
      {children}
    </Tab>
  )
}

function BearerAuth() {
  const { register } = useFormContext()

  return (
    <FormControl>
      <InputForm type='name' borderRadius={8} {...register('auth.bearer.token')} placeholder='Token' />
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
