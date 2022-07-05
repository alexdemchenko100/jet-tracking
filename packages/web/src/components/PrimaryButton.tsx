import { Button, ButtonProps } from '@chakra-ui/react'
import Text from './Text'
import { TextVariants } from '../types/common'

interface Props extends ButtonProps {
  label: string
  variant: TextVariants
  color: string
  onClick?: () => void
  isOutline?: boolean
}

const PrimaryButton: React.FC<Props> = (props) => {
  const { label, variant, color, isOutline, onClick, ...rest } = props
  return (
    <>
      {isOutline ? (
        <Button
          onClick={onClick}
          bg='transparent'
          borderWidth='2px'
          borderStyle='solid'
          borderColor='darkblue.100'
          borderRadius='24px'
          colorScheme={'whiteAlpha'}
          padding={'10px 24px 11px'}
          height='auto'
          _hover={{
            bg: 'linear-gradient(0deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05)), #ffffff;',
          }}
          _active={{
            bg: 'linear-gradient(0deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08)), #ffffff;',
          }}
          {...rest}
        >
          <Text variant={variant} color={color}>
            {label}
          </Text>
        </Button>
      ) : (
        <Button
          onClick={onClick}
          bg='darkblue.100'
          borderRadius='24px'
          padding={'10px 30px 11px'}
          height='auto'
          _hover={{ bg: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), #16D8B5;' }}
          _active={{
            bg: 'linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), #16D8B5;',
          }}
          {...rest}
        >
          <Text variant={variant} color={color}>
            {label}
          </Text>
        </Button>
      )}
    </>
  )
}

export default PrimaryButton
