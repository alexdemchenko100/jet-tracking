import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react'
import { useFormContext, useFieldArray, Controller } from 'react-hook-form'

function BasicAuth() {
  const { register } = useFormContext()

  return (
    <>
      <FormControl>
        <FormLabel htmlFor='username'>Username</FormLabel>
        <Input type='name' {...register('auth.basic.username')} />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor='password'>Password</FormLabel>
        <Input type='password' autoComplete='off' {...register('auth.basic.password')} />
      </FormControl>
    </>
  )
}

function BearerAuth() {
  const { register } = useFormContext()

  return (
    <FormControl>
      <FormLabel htmlFor='token'>Token</FormLabel>
      <Input type='name' {...register('auth.bearer.token')} />
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
              <Tab>None</Tab>
              <Tab>Basic Auth</Tab>
              <Tab>Bearer Auth</Tab>
            </TabList>

            <TabPanels>
              <TabPanel />
              <TabPanel>
                <BasicAuth />
              </TabPanel>
              <TabPanel>
                <BearerAuth />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )
      }}
    />
  )
}
