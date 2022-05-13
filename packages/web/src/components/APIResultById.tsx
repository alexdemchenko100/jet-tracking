import { MonitorResult } from '@httpmon/db'
import { useQuery } from 'react-query'
import axios from 'axios'
import { APIResult } from './APIResult'
import { useParams } from 'react-router-dom'

interface Props {
  id?: string
  onClose?: () => void
}

/**
 * Given Monitor Result Id, download the result and show
 *
 * @param id
 * @returns
 */
export function APIResultById({ id, onClose }: Props) {
  const params = useParams()
  const resultID = id || params.id

  const {
    isLoading,
    data: result,
    error,
  } = useQuery<MonitorResult, Error>(
    resultID ?? 'id', //only enabled when id is valid
    async () => {
      const resp = await axios({
        method: 'GET',
        url: `/monitors/results/${resultID}`,
      })
      return resp.data
    },
    {
      enabled: Boolean(resultID),
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
