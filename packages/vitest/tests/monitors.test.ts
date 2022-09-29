import { Monitor, MonitorAssertionResult, MonitorResult } from '@httpmon/db'
import { expect, test } from 'vitest'

import { req } from './utils'

test('should run a GET monitor', async () => {
  const resp = await req.post<MonitorResult>('ondemand/run', {
    json: {
      name: 'ondemand',
      status: 'ondemand',
      url: 'https://httpbin.org/headers',
      frequency: '60',
    },
  })

  expect(resp.statusCode).toBe(200)

  const res = resp.body
  expect(res.err).toBeFalsy()
  expect(res.code).toBe(200)
})

test('should run a POST monitor', async () => {
  const resp = await req.post<MonitorResult>('ondemand/run', {
    json: {
      name: 'ondemand',
      status: 'ondemand',
      url: 'https://httpbin.org/post',
      frequency: '60',
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

test('should fail on 401 code', async () => {
  const resp = await req.post<MonitorResult>('ondemand/run', {
    json: {
      name: 'ondemand',
      status: 'ondemand',
      url: 'https://httpbin.org/status/401',
      frequency: '60',
    },
  })

  expect(resp.statusCode).toBe(200)

  const res = resp.body
  expect(res.err).toBe('ERR_HTTP_ERROR_CODE')
  expect(res.code).toBe(401)
})

test('should succeed on 401 status code with assertion of code = 401', async () => {
  const resp = await req.post<MonitorResult>('ondemand/run', {
    json: {
      name: 'ondemand',
      status: 'ondemand',
      url: 'https://httpbin.org/status/401',
      frequency: '60',
      assertions: [{ op: '=', type: 'code', value: '401' }],
    },
  })

  expect(resp.statusCode).toBe(200)

  const res = resp.body
  expect(res.err).toBeFalsy()
  expect(res.code).toBe(401)
})

test('should assert on JSON body', async () => {
  const resp = await req.post<MonitorResult>('ondemand/run', {
    json: {
      name: 'ondemand',
      status: 'ondemand',
      url: 'https://httpbin.org/headers',
      frequency: '60',
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

test('should fail to assert on JSON body with invalid path', async () => {
  const resp = await req.post<MonitorResult>('ondemand/run', {
    json: {
      name: 'ondemand',
      status: 'ondemand',
      url: 'https://httpbin.org/headers',
      frequency: '60',
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

test('should respond ENOTFOUND on bad url', async () => {
  const resp = await req.post<MonitorResult>('ondemand/run', {
    json: {
      name: 'ondemand',
      status: 'ondemand',
      url: 'https://unknownddddbin.com',
      frequency: '60',
      assertions: [{ op: '=', type: 'code', value: '401' }],
    },
  })

  expect(resp.statusCode).toBe(200)

  const res = resp.body
  expect(res.err).toBe('ENOTFOUND')
  expect(res.code).toBe(0)
})

test('should create and delete a monitor', async () => {
  const name = Math.random().toString().slice(2, 9)

  const resp = await req.put<Monitor>('monitors', {
    json: {
      name,
      status: 'paused',
      url: 'https://www.proautoma.com',
      frequency: '60',
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
