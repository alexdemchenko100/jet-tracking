import {
  Button,
  ButtonProps,
} from '@chakra-ui/react'
import Text from './Text'
import { TextVariants } from '../types/common'

interface Props extends ButtonProps {
  label: string,
  variant: TextVariants,
  color: string,
  onClick?: () => void,
}

const PrimaryButton: React.FC<Props> = (props) => {
  const { label, variant, color, onClick, ...rest } = props
  return (
    <Button
      onClick={onClick}
      bg='darkblue.100'
      borderRadius='24px'
      padding={'10px 30px 11px'}
      height='auto'
      _hover={{ bg: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), #17468F;' }}
      _active={{ bg: 'linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), #17468F;' }}
      {...rest}
    >
      <Text variant={variant} color={color}>{label}</Text>
    </Button>
  )
}

export default PrimaryButton
