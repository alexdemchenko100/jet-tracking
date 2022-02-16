import { PeerCertificate } from 'tls'
import axios, { AxiosResponse } from 'axios'

import { MonitorDTO, MonitorResult } from '@httpmon/db'
import timer, { Timings } from '@szmarczak/http-timer'
import https from 'https'

const transport = {
  request: function httpsWithTimer(...args: any[]) {
    const request = https.request.apply(null, args)
    timer(request)
    return request
  },
}

function responseToMonitorResult(resp: AxiosResponse<any, any> | null) {
  const body: string = resp?.data?.toString() ?? ''
  let timings: Timings = resp?.request?.timings ?? null
  return {
    code: resp?.status ?? 0,
    codeStatus: resp?.statusText ?? '',
    dnsLookupTime: timings?.phases?.dns ?? 0,
    tcpConnectTime: timings?.phases?.tcp ?? 0,
    tlsHandshakeTime: timings?.phases?.tls ?? 0,
    timeToFirstByte: timings?.phases?.firstByte ?? 0,
    totalTime: timings?.phases?.total ?? 0,
    protocol: '',
    body,
    bodySize: body.length,
    certCommonName: '',
    certExpiryDays: 0,
  }
}

export async function execMonitor(mon: MonitorDTO) {
  let certCommonName = ''
  let certExpiryDays = 0
  let resp: AxiosResponse<any, any>
  try {
    resp = await axios.request({
      url: mon.url,
      method: mon.method == 'GET' ? 'GET' : 'POST',
      data: mon.body == '' ? undefined : mon.body,
      //@ts-ignore
      transport,
      httpsAgent: new https.Agent({ keepAlive: false }),
      responseType: 'text',
    })

    const certificate: PeerCertificate =
      resp.request.res.socket.getPeerCertificate(false)
    if (certificate && certificate.subject) {
      certCommonName = certificate.subject.CN
      const expiry = new Date(certificate.valid_to).valueOf()
      const now = new Date().valueOf()
      certExpiryDays = Math.floor((expiry - now) / 1000 / 60 / 60 / 24)
    }

    const result: MonitorResult = {
      ...responseToMonitorResult(resp),
      monitorId: mon.id ?? 'ondemand',
      certCommonName,
      certExpiryDays,
      err: '',
    }

    return result
  } catch (e) {
    if (e.response) {
      const resp = e.response
      return {
        ...responseToMonitorResult(resp),
        monitorId: mon.id ?? 'ondemand',
        certCommonName,
        certExpiryDays,
        err: '',
      }
    } else {
      return {
        ...responseToMonitorResult(null),
        err: e?.message ?? e.toString(),
        monitorId: mon.id ?? 'ondemand',
      }
    }
  }
}
