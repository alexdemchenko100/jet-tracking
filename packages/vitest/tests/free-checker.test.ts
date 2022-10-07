import { MonitorResult } from '@httpmon/db'
import { expect, describe, it } from 'vitest'
import { anonReq } from './utils'

describe('Check anon check', () => {
  it('shoud add header', async () => {
    const resp = await anonReq.post<MonitorResult>('anon/run', {
      json: {
        name: 'ondemand',
        url: 'https://httpbin.org/headers',
        locations: ['us-east1'],
        preScript: 'ctx.request.headers["Foo"] = "Bar"',
      },
    })

    expect(resp.statusCode).toBe(200)

    const res = resp.body
    expect(res.err).toBeFalsy()
    expect(res.code).toBe(200)
    const postResp = JSON.parse(res.body)
    expect(postResp.headers.Foo).toBe('Bar')
  })
})
