import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react'
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
          <CodeMirror
            height='200px'
            extensions={[javascript({ jsx: true })]}
            value={field.value}
            onChange={(value, _viewUpdate) => {
              field.onChange(value)
            }}
          />
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
                <Tab key={index}>{title}</Tab>
              ))}
            </TabList>

            <TabPanels>
              {table.map(({ index, bodyType }) => (
                <TabPanel key={index}>{bodyType === '' ? null : bodyEditor()}</TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        )
      }}
    />
  )
}
