import { PeerCertificate } from 'tls'
import axios from 'axios'

import { MonitorDTO, emptyMonitorResultDTO, MonitorResult } from '@httpmon/db'
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

    let body = ''
    if (typeof resp.data == 'string') {
      body = resp.data
    } else {
      body = JSON.stringify(resp.data)
    }

    const result: MonitorResult = {
      ...emptyMonitorResultDTO,
      monitorId: mon.id ?? 'ondemand',
      code: resp.status ?? 0,
      codeStatus: resp.statusText ?? '',
      dnsLookupTime: resp.request.timings.phases.dns ?? 0,
      tcpConnectTime: resp.request.timings.phases.tcp ?? 0,
      tlsHandshakeTime: resp.request.timings.phases.tls ?? 0,
      timeToFirstByte: resp.request.timings.phases.firstByte ?? 0,
      totalTime: resp.request.timings.phases.total ?? 0,
      body,
      bodySize: body.length,
      certCommonName,
      certExpiryDays,
      err: '',
    }

    return result
  } catch (e) {
    return { ...emptyMonitorResultDTO, err: e }
  }
}
