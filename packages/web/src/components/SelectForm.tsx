import {
  Select,
  SelectProps,
} from '@chakra-ui/react'

const SelectForm: React.FC<SelectProps> = (props) => {
  const { children, ...rest } = props
  return (
    <Select borderRadius={8} color='gray.100' borderColor='gray.200' {...rest}>
      {children}
    </Select>
  )
}

export default SelectForm
