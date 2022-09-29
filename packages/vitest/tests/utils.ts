import got from 'got'

export const req = got.extend({
  prefixUrl: 'http://localhost:8080/api',
  throwHttpErrors: false,
  responseType: 'json',
  headers: {
    'user-agent': 'API Checker/1.0',
    'x-proautoma-accountid': import.meta.env.VITE_ACCOUNT_ID,
    Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
  },
  timeout: { request: 5000 },
})

export function randomString() {
  return Math.random().toString().slice(2, 9)
}
