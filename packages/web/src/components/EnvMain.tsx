import { MonEnv } from '@httpmon/db'
import { useOutletContext } from 'react-router-dom'
import { Section, Text } from '../components'

interface Props {
  envs?: MonEnv[]
}

export default function EnvMain() {
  const { envs }: Props = useOutletContext()

  return (
    <Section w='100%' minH='80'>
      {envs && envs.length === 0 ? (
        <Text as='div' py='40' textAlign='center' variant='paragraph' color='gray.300'>
          There is no envs yet.
        </Text>
      ) : (
        <>&nbsp;</>
      )}
    </Section>
  )
}
