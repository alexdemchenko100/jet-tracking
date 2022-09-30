import { Monitor, MonitorAssertionResult, MonitorResult } from '@httpmon/db'
import { expect, describe, it } from 'vitest'
import { randomString, req } from './utils'

describe('Monitor CRUD operations', () => {
  it('should run a check on GET monitor', async () => {
    const resp = await req.post<MonitorResult>('ondemand/run', {
      json: {
        name: 'ondemand',
        url: 'https://httpbin.org/headers',
        locations: ['us-east1'],
      },
    })

    expect(resp.statusCode).toBe(200)

    const res = resp.body
    expect(res.err).toBeFalsy()
    expect(res.code).toBe(200)
  })

  it('should run a check on POST monitor', async () => {
    const resp = await req.post<MonitorResult>('ondemand/run', {
      json: {
        name: 'ondemand',
        url: 'https://httpbin.org/post',
        locations: ['us-east1'],
        method: 'POST',
        bodyType: 'application/json',
        body: JSON.stringify({ foo: 'bar' }),
      },
    })

    expect(resp.statusCode).toBe(200)

    const res = resp.body
    expect(res.err).toBeFalsy()
    expect(res.code).toBe(200)

    const postResp = JSON.parse(res.body)
    expect(postResp.json.foo).toBe('bar')
  })

  it('should fail on 401 response result', async () => {
    const resp = await req.post<MonitorResult>('ondemand/run', {
      json: {
        name: 'ondemand',
        url: 'https://httpbin.org/status/401',
        locations: ['us-east1'],
      },
    })

    expect(resp.statusCode).toBe(200)

    const res = resp.body
    expect(res.err).toBe('ERR_HTTP_ERROR_CODE')
    expect(res.code).toBe(401)
  })

  it('should succeed on 401 response code with assertion of code = 401', async () => {
    const resp = await req.post<MonitorResult>('ondemand/run', {
      json: {
        name: 'ondemand',
        status: 'ondemand',
        url: 'https://httpbin.org/status/401',
        locations: ['us-east1'],
        assertions: [{ op: '=', type: 'code', value: '401' }],
      },
    })

    expect(resp.statusCode).toBe(200)

    const res = resp.body
    expect(res.err).toBeFalsy()
    expect(res.code).toBe(401)
  })

  it('should assert on JSON body', async () => {
    const resp = await req.post<MonitorResult>('ondemand/run', {
      json: {
        name: 'ondemand',
        url: 'https://httpbin.org/headers',
        locations: ['us-east1'],
        assertions: [{ op: '=', type: 'jsonBody', name: '$.headers.Host', value: 'httpbin.org' }],
      },
    })

    expect(resp.statusCode).toBe(200)

    const res = resp.body
    expect(res.err).toBeFalsy()
    expect(res.code).toBe(200)
    const assertRes = res.assertResults as MonitorAssertionResult[]
    expect(assertRes[0].fail).toBeFalsy()
    expect(assertRes[0].op).toBe('=')
    expect(assertRes[0].name).toBe('$.headers.Host')
    expect(assertRes[0].value).toBe('httpbin.org')
  })

  it('should fail to assert on JSON body with invalid path', async () => {
    const resp = await req.post<MonitorResult>('ondemand/run', {
      json: {
        name: 'ondemand',
        url: 'https://httpbin.org/headers',
        locations: ['us-east1'],
        assertions: [{ op: '=', type: 'jsonBody', name: '$.headers', value: 'httpbin.org' }],
      },
    })

    expect(resp.statusCode).toBe(200)

    const res = resp.body
    expect(res.err).toBe('ERR_ASSERTIONS')
    expect(res.code).toBe(200)
    const assertRes = res.assertResults as MonitorAssertionResult[]
    expect(assertRes[0].fail).toBeTruthy()
    expect(assertRes[0].op).toBe('=')
    expect(assertRes[0].name).toBe('$.headers')
    expect(assertRes[0].value).toBe('httpbin.org')
  })

  it('should respond ENOTFOUND on unreachable url', async () => {
    const resp = await req.post<MonitorResult>('ondemand/run', {
      json: {
        name: 'ondemand',
        url: 'https://unknownddddbin.com',
        locations: ['us-east1'],
        assertions: [{ op: '=', type: 'code', value: '401' }],
      },
    })

    expect(resp.statusCode).toBe(200)

    const res = resp.body
    expect(res.err).toBe('ENOTFOUND')
    expect(res.code).toBe(0)
  })

  it('should create and delete a monitor', async () => {
    const name = randomString()

    const resp = await req.put<Monitor>('monitors', {
      json: {
        name,
        status: 'paused',
        url: 'https://www.proautoma.com',
        locations: ['us-east1'],
      },
    })

    expect(resp.statusCode).toBe(200)

    const { id, name: monName } = resp.body
    expect(name).toBe(monName)

    //make sure listing shows it
    const monList = await req.get<{ total: number; items: Monitor[] }>('monitors')
    expect(monList.body.items.find((i) => i.name == monName))

    //now delete it
    const delResp = await req.delete(`monitors/${id}`)
    expect(delResp.statusCode).toBe(200)

    //now, get monitors and make sure its deleted

    const monListAfterDelete = await req.get<{ total: number; items: Monitor[] }>('monitors')
    expect(monListAfterDelete.body.items.find((i) => i.name == monName))
  })
})
