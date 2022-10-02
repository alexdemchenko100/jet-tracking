import { MonitorResult } from '@httpmon/db'
import { expect, describe, it } from 'vitest'
import { req } from './utils'

describe('Check pre-script', () => {
  it('shoud add header', async () => {
    const resp = await req.post<MonitorResult>('ondemand/run', {
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

  it('shoud script template env variable', async () => {
    const resp = await req.post<MonitorResult>('ondemand/run', {
      json: {
        name: 'ondemand',
        url: '{{BASE}}/headers',
        locations: ['us-east1'],
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
        locations: ['us-east1'],
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

  it('shoud script template query params variable', async () => {
    const resp = await req.post<MonitorResult>('ondemand/run', {
      json: {
        name: 'ondemand',
        url: 'https://httpbin.org/get',
        preScript: 'ctx.request.queryParams["foo"] = "bar"',
      },
    })

    expect(resp.statusCode).toBe(200)

    const res = resp.body
    expect(res.err).toBeFalsy()
    expect(res.code).toBe(200)
    const postResp = JSON.parse(res.body)
    expect(postResp.url).contains('foo=bar')
  })

  it('shoud script url parameter', async () => {
    const targetUrl = 'https://httpbin.org/get'
    const resp = await req.post<MonitorResult>('ondemand/run', {
      json: {
        name: 'ondemand',
        url: 'https://httpbin.org/header',
        preScript: `ctx.request.url = "${targetUrl}"`,
      },
    })

    expect(resp.statusCode).toBe(200)

    const res = resp.body
    expect(res.err).toBeFalsy()
    expect(res.code).toBe(200)
    const postResp = JSON.parse(res.body)
    expect(postResp.url).toBe(targetUrl)
  })

  it('shoud script fail on synatx error', async () => {
    const resp = await req.post<MonitorResult>('ondemand/run', {
      json: {
        name: 'ondemand',
        url: 'https://httpbin.org/header',
        preScript: ` - d <> 23`,
      },
    })

    expect(resp.statusCode).toBe(200)

    const res = resp.body
    expect(res.err).contains('SyntaxError')
  })
})
