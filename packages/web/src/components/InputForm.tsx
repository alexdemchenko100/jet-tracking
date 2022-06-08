import {
  Input,
  InputProps,
} from '@chakra-ui/react'

const InputForm: React.FC<InputProps> = (props) => {
  const { ...rest } = props
  return (
    <Input borderRadius={8} borderColor='gray.200' {...rest} />
  )
}

export default InputForm
