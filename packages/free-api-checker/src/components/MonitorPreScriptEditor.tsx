import { Box } from '@chakra-ui/react'
import { Controller, useFormContext } from 'react-hook-form'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'

export function MonitorPreScriptEditor() {
  const { control } = useFormContext()

  return (
    <Controller
      control={control}
      name='preScript'
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
              extensions={[javascript({ jsx: false })]}
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
