import { APIGatewayEvent, SNSEvent } from 'aws-lambda'

import { Static, Type } from '@sinclair/typebox'
import { PeerCertificate } from 'tls'
import axios from 'axios'

export const MonitorSchema = Type.Object({
  id: Type.Optional(Type.String()),
  name: Type.String({ minLength: 2 }),
  url: Type.String({ format: 'url' }),
  method: Type.String(),
  body: Type.String(),
  frequency: Type.Integer(),
  headers: Type.String({ default: '' }),
  queryParams: Type.String({ default: '' }),
  cookies: Type.String({ default: '' }),
})

export type MonitorDTO = Static<typeof MonitorSchema>

export const MonitorResultSchema = Type.Object({
  id: Type.Optional(Type.String()),
  createdAt: Type.Optional(Type.String()),
  err: Type.String(),
  body: Type.String(),
  bodySize: Type.Integer(),
  code: Type.Integer(),
  codeStatus: Type.String(),
  protocol: Type.String(),

  dnsLookupTime: Type.Integer(),
  tcpConnectTime: Type.Integer(),
  tlsHandshakeTime: Type.Integer(),
  timeToFirstByte: Type.Integer(),
  totalTime: Type.Integer(),
  certExpiryDays: Type.Integer(),
  certCommonName: Type.String(),
})

export type MonitorResultDTO = Static<typeof MonitorResultSchema>

const emptyMonitorResultDTO: MonitorResultDTO = {
  code: 0,
  codeStatus: '',
  body: '',
  bodySize: 0,
  protocol: '',
  dnsLookupTime: 0,
  tcpConnectTime: 0,
  tlsHandshakeTime: 0,
  timeToFirstByte: 0,
  totalTime: 0,
  certCommonName: '',
  certExpiryDays: 0,
  err: '',
}
import timer from '@szmarczak/http-timer'
import https from 'https'

const transport = {
  request: function httpsWithTimer(...args: any[]) {
    const request = https.request.apply(null, args)
    timer(request)
    return request
  },
}
export async function execMonitor(mon: MonitorDTO) {
  let certCommonName = ''
  let certExpiryDays = 0
  try {
    const resp = await axios.request({
      url: mon.url,
      method: mon.method == 'GET' ? 'GET' : 'POST',
      data: mon.body == '' ? undefined : mon.body,
      transport,
      //keepAlive must be false - otherwise, getPeerCertificate() returns null on reuse
      httpsAgent: new https.Agent({ keepAlive: false }),
    })

    console.log('status: ', resp.request.timings)
    // console.log('peer : ', resp.request.res.socket.isSessionReused())

    const certificate: PeerCertificate =
      resp.request.res.socket.getPeerCertificate(false)
    // console.log(certificate)

    if (certificate) {
      certCommonName = certificate.subject.CN
      const expiry = new Date(certificate.valid_to).valueOf()
      const now = new Date().valueOf()
      certExpiryDays = (expiry - now) / 1000 / 60 / 60 / 24
    }

    const result: MonitorResultDTO = {
      ...emptyMonitorResultDTO,
      code: resp.status ?? 0,
      codeStatus: resp.statusText ?? '',
      body: resp.data ?? '',
      bodySize: resp.data.length ?? 0,
      dnsLookupTime: resp.request.timings.phases.dns ?? 0,
      tcpConnectTime: resp.request.timings.phases.tcp ?? 0,
      tlsHandshakeTime: resp.request.timings.phases.tls ?? 0,
      timeToFirstByte: resp.request.timings.phases.firstByte ?? 0,
      totalTime: resp.request.timings.phases.total ?? 0,
      certCommonName,
      certExpiryDays,
      err: '',
    }

    //console.log(resp)
    return result
  } catch (e) {
    console.log('error: ', e)

    return { ...emptyMonitorResultDTO, err: e }
  }
}

export async function sns(event: SNSEvent) {
  const message = event.Records[0].Sns.Message
  console.log('monitor msg: ', message)
  const mon = JSON.parse(message)
  return execMonitor(mon as MonitorDTO)
}

export async function api(event: APIGatewayEvent) {
  const message = event.body ?? '{}'
  console.log('api monitor msg: ', message)
  const mon = JSON.parse(message)
  return execMonitor(mon as MonitorDTO)
}
