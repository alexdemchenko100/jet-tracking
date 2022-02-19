import React, { useState } from 'react'

import axios from 'axios'
import {
  Button,
  Box,
  Input,
  Text,
  Textarea,
  FormLabel,
  VStack,
  Heading,
  SimpleGrid,
} from '@chakra-ui/react'

import { useForm } from 'react-hook-form'

type StatsType = {
  [key: string]: string | number
}
function RealTimeMonitor() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<StatsType>({})

  const onSubmit = (data: StatsType) => {
    setLoading(true)

    const mon = {
      name: 'ondemand',
      url: data.url,
      frequency: 1,
      status: 'active',
    }
    axios
      .post('http://localhost:3006/monitors/ondemand', mon)

      .then((resp) => {
        setLoading(false)
        console.log('resp: ', resp.data)

        let data = { ...resp.data }
        data['body'] = undefined
        if (data['bodyJson']) {
          data['bodyJson'] = JSON.stringify(
            JSON.parse(data['bodyJson'] as string),
            null,
            2
          )
        }

        setStats(data)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const { register, handleSubmit, formState } = useForm()

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
    <Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* <LoadingOverlay visible={loading} /> */}
        <FormLabel>Url</FormLabel>
        <Input
          required
          type="url"
          placeholder="url here"
          {...register('url')}
        />
        <Button
          mt="4"
          color="violet"
          type="submit"
          isLoading={formState.isSubmitting}
        >
          Test!
        </Button>
      </form>

      {/* {console.log('STT: ', Object.keys(stats))} */}

      <SimpleGrid mt="4" columns={[1, 2, 4]} spacing={10}>
        {stats &&
          Object.keys(stats).map((name) => (
            <Card name={name} val={stats[name]} />
          ))}
      </SimpleGrid>
    </Box>
  )
}

export default RealTimeMonitor
