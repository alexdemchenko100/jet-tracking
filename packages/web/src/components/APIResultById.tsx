import { MonitorResult } from '@httpmon/db'
import { useQuery } from 'react-query'
import axios from 'axios'
import { APIResult } from './APIResult'

interface Props {
  id: string
  onClose?: () => void
}

/**
 * Given Monitor Result Id, download the result and show
 *
 * @param id
 * @returns
 */
export function APIResultById({ id, onClose }: Props) {
  const {
    isLoading,
    data: result,
    error,
  } = useQuery<MonitorResult, Error>(
    id ?? 'id', //only enabled when id is valid
    async () => {
      const resp = await axios({
        method: 'GET',
        url: `/monitors/results/${id}`,
      })
      return resp.data
    },
    {
      enabled: Boolean(id),
    }
  )

  return (
    <>
      {isLoading && <p>Loading ...</p>}
      {error && <p>Err: {error.message}</p>}
      {result && <APIResult result={result} onClose={onClose} />}
    </>
  )
}
