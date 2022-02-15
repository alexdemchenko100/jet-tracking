import React, { useState } from 'react'
import './App.css'

import axios from 'axios'
import {
  Button,
  Box,
  ChakraProvider,
  Input,
  Text,
  Textarea,
  FormLabel,
  Container,
  VStack,
  Heading,
  SimpleGrid,
} from '@chakra-ui/react'

import { useForm } from 'react-hook-form'

type StatsType = {
  [key: string]: string | number
}
function App() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<StatsType>({ start: '333' })

  const onSubmit = (data: StatsType) => {
    setLoading(true)

    const mon = {
      url: data.url,
    }
    axios
      .post('http://localhost:1323/monitors/ondemand', mon)

      .then((resp) => {
        setLoading(false)
        console.log('resp: ', resp.data)
        setStats(resp.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const { register, handleSubmit, formState } = useForm()

  // {
  //   "startedAt": "2022-01-30T16:28:21.957494208-08:00",
  //   "url": "https://www.google.com/",
  //   "err": "",
  //   "body": "",
  //   "bodySize": 14117,
  //   "code": 200,
  //   "protocol": "TLSv1.3",
  //   "dnsLookedup": 0,
  //   "tcpConnEstablished": 20,
  //   "tlsHandshakeDone": 50,
  //   "timeToFirstByte": 162,
  //   "totalTime": 164,
  //   "certExpiryDays": 49,
  //   "certCommonName": "www.google.com"
  // }

  function Card(props: { [key: string]: string | number }) {
    return (
      <VStack alignItems="flex-start" p={3}>
        <Heading size="md">{props.name}</Heading>
        <Heading size="sm" color="teal">
          {props.val}
        </Heading>
      </VStack>
    )
  }
  return (
    <ChakraProvider>
      <Container maxWidth={'container.xl'} centerContent>
        <Box>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* <LoadingOverlay visible={loading} /> */}
            <FormLabel>Url</FormLabel>
            <Input required placeholder="url here" {...register('url')} />
            <Button
              mt="md"
              color="violet"
              type="submit"
              isLoading={formState.isSubmitting}
            >
              Test!
            </Button>
          </form>

          {/* {console.log('STT: ', Object.keys(stats))} */}

          <SimpleGrid columns={[1, 2, 4]} spacing={10}>
            {stats &&
              Object.keys(stats).map((name) => (
                <Card name={name} val={stats[name]} />
              ))}
          </SimpleGrid>
        </Box>
      </Container>
    </ChakraProvider>
  )
}

export default App
