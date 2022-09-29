import { Monitor, MonitorAssertionResult, MonitorResult } from '@httpmon/db'
import { expect, describe, it } from 'vitest'
import { randomString, req } from './utils'

describe('Check pre-script', () => {
  it('shoud add header', async () => {
    const resp = await req.post<MonitorResult>('ondemand/run', {
      json: {
        name: 'ondemand',
        url: 'https://httpbin.org/headers',
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

  it('shoud add template env variable', async () => {
    const resp = await req.post<MonitorResult>('ondemand/run', {
      json: {
        name: 'ondemand',
        url: '{{BASE}}/headers',
        preScript: 'ctx.env["BASE"] = "https://httpbin.org"',
      },
    })

    expect(resp.statusCode).toBe(200)

    const res = resp.body
    expect(res.err).toBeFalsy()
    expect(res.code).toBe(200)
    const postResp = JSON.parse(res.body)
    expect(postResp.headers.Host).toBe('httpbin.org')
  })

  it('shoud make axios calls', async () => {
    const resp = await req.post<MonitorResult>('ondemand/run', {
      json: {
        name: 'ondemand',
        url: 'https://httpbin.org/bearer',
        headers: [['Authorization', 'Bearer {{TOKEN}}']],
        preScript: `
          const axios = require('axios');
          const { data } = await axios.get('https://httpbin.org/headers');

          ctx.env['TOKEN'] = data.headers.Host
        `,
      },
    })

    expect(resp.statusCode).toBe(200)

    const res = resp.body
    expect(res.err).toBeFalsy()
    expect(res.code).toBe(200)
    const postResp = JSON.parse(res.body)
    expect(postResp.authenticated).toBe(true)
    expect(postResp.token).toBe('httpbin.org')
  })
})
