import { Tabs, TabList, Tab, TabPanels, TabPanel, Box } from '@chakra-ui/react'
import { useFormContext, Controller } from 'react-hook-form'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'

const table = [
  { index: 0, bodyType: '', title: 'None' },
  { index: 1, bodyType: 'application/json', title: 'JSON' },
  { index: 2, bodyType: 'text/xml', title: 'XML' },
  { index: 3, bodyType: 'text/html', title: 'HTML' },
  { index: 4, bodyType: 'text/plain', title: 'Plain Text' },
]

function bodyTypeToIndex(bodyType: string) {
  return table.findIndex(({ bodyType: t }) => t === bodyType)
}

function indexToBodyType(index: number) {
  if (index < 0 || index >= table.length) {
    return ''
  }
  return table[index].bodyType
}

function bodyEditor() {
  const { control } = useFormContext()

  return (
    <Controller
      control={control}
      name='body'
      render={({ field }) => {
        return (
          <Box
            bg='white'
            border='1px'
            borderStyle='solid'
            borderColor='gray.200'
            borderRadius='lg'
            overflow='hidden'
          >
            <CodeMirror
              height='200px'
              extensions={[javascript({ jsx: true })]}
              value={field.value}
              onChange={(value, _viewUpdate) => {
                field.onChange(value)
              }}
            />
          </Box>
        )
      }}
    />
  )
}

export function MonitorBodyEditor() {
  const { control } = useFormContext()

  return (
    <Controller
      control={control}
      name='bodyType'
      render={({ field }) => {
        return (
          <Tabs
            variant='soft-rounded'
            size='sm'
            defaultIndex={bodyTypeToIndex(field.value)}
            index={bodyTypeToIndex(field.value)}
            onChange={(index) => {
              field.onChange(indexToBodyType(index))
            }}
          >
            <TabList>
              {table.map(({ index, title }) => (
                <Tab
                  key={index}
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
                  {title}
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              {table.map(({ index, bodyType }) => (
                <TabPanel pb='0' pt='6' px='0' key={index}>
                  {bodyType === '' ? null : bodyEditor()}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        )
      }}
    />
  )
}
