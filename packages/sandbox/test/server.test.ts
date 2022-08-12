test('basic', () => {
  expect(5 + 2).toBe(7)
})

import app from '../src'

describe('example tests', () => {
  test('example is loaded', async () => {
    const res = await app.inject({
      url: '/example',
    })

    expect(res.payload).toBe('this is an example')
  })
})
