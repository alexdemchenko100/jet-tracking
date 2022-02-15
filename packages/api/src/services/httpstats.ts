import { MonitorDTO } from './monitor-service.js'

import { Static, Type } from '@sinclair/typebox'
import { PeerCertificate } from 'tls'
import axios from 'axios'

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

// import got from 'got'
// export async function execMonitorGOT(mon: MonitorDTO) {
//   let certCommonName = ''
//   let certExpiryDays = 0
//   try {
//     const resp = await got({
//       url: mon.url,
//       method: mon.method == 'GET' ? 'GET' : 'POST',
//       body: mon.body == '' ? undefined : mon.body,
//       https: {
//         checkServerIdentity: (_: string, certificate: PeerCertificate) => {
//           certCommonName = certificate.subject.CN
//           const expiry = new Date(certificate.valid_to).valueOf()
//           const now = new Date().valueOf()
//           certExpiryDays = (expiry - now) / 1000 / 60 / 60 / 24
//         },
//       },
//     })

//     const result: MonitorResultDTO = {
//       code: resp.statusCode ?? 0,
//       codeStatus: resp.statusMessage ?? '',
//       body: resp.body ?? '',
//       bodySize: resp.body.length ?? 0,
//       protocol: resp.httpVersion ?? '',
//       dnsLookupTime: resp.timings.phases.dns ?? 0,
//       tcpConnectTime: resp.timings.phases.tcp ?? 0,
//       tlsHandshakeTime: resp.timings.phases.tls ?? 0,
//       timeToFirstByte: resp.timings.phases.firstByte ?? 0,
//       totalTime: resp.timings.phases.total ?? 0,
//       certCommonName,
//       certExpiryDays,
//       err: '',
//     }

//     return result
//   } catch (e) {
//     return { ...emptyMonitorResultDTO, err: e }
//   }
// }

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
      //@ts-ignore
      transport,
    })

    const certificate: PeerCertificate =
      resp.request.res.socket.getPeerCertificate(false)
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

    return result
  } catch (e) {
    return { ...emptyMonitorResultDTO, err: e }
  }
}
