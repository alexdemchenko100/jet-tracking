import { Flex } from '@chakra-ui/react'
import { Section, Text, PrimaryButton } from '../components'

interface Props {
  formChanged?: boolean
  resetForm: () => void
}

function SettingsHeader({ formChanged = true, resetForm }: Props) {
  return (
    <Section position='absolute' top='0' left='0' width='100%'>
      <Flex alignItems='center' justify={'space-between'}>
        <Text variant='header' color='black'>
          Settings
        </Text>
        <Flex gap={2}>
          <PrimaryButton
            label='Cancel'
            isOutline
            disabled={!formChanged}
            variant='emphasis'
            color={'darkblue.100'}
            onClick={resetForm}
          ></PrimaryButton>
          <PrimaryButton
            label='Save'
            disabled={!formChanged}
            variant='emphasis'
            color={'white'}
            type='submit'
          ></PrimaryButton>
        </Flex>
      </Flex>
    </Section>
  )
}

export default SettingsHeader
