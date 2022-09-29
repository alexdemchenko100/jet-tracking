import { Monitor, MonitorResult, MonitorTuples } from '@httpmon/db'
import { Timings } from '@szmarczak/http-timer/dist/source'
import { getCloudRegion } from 'src/Context'
import got, { Method, RequestError, Response } from 'got'

export function makeMonitorResultError(monitor: Monitor, err: string) {
  let result: MonitorResult = {
    ...responseToMonitorResult(),
    url: monitor.url,
    monitorId: monitor.id ?? '',
    accountId: monitor.accountId,
    err: err,
  }

  return result
}

export function responseToMonitorResult(resp?: Response<string>) {
  return {
    ...emptyResponse(),
    ...convertTimings(resp?.timings),
    code: resp?.statusCode ?? 0,
    ip: resp?.ip ?? '',
    body: resp?.body ?? '',
    bodySize: resp?.body.length ?? 0,
    headers: resp?.headers ? headersToTuples(resp?.headers) : [],
  }
}

export function requestErrorToMonitorResult(reqError: RequestError) {
  return responseToMonitorResult(reqError.response as Response<string>)
}

function emptyResponse() {
  return {
    ip: '',
    protocol: '',
    body: '',
    bodySize: 0,
    headers: [],
    certCommonName: '',
    certExpiryDays: 0,
    code: 0,
    location: getCloudRegion(),
  }
}

function convertTimings(timings?: Timings) {
  return {
    waitTime: timings?.phases?.wait ?? 0,
    dnsTime: timings?.phases?.dns ?? 0,
    tcpTime: timings?.phases?.tcp ?? 0,
    tlsTime: timings?.phases?.tls ?? 0,
    uploadTime: timings?.phases?.request ?? 0,
    ttfb: timings?.phases?.firstByte ?? 0,
    downloadTime: timings?.phases?.download ?? 0,
    totalTime: timings?.phases?.total ?? 0,
  }
}

function headersToMap(headers: MonitorTuples = []) {
  let hmap: { [key: string]: string } = {}
  headers.forEach((header) => {
    hmap[header[0]] = header[1]
  })
  return hmap
}

/**
 *
 * Axios formats duplicate response headers as an array
 * ex: { "set-cookie": [ "cookie-1", "cookie-2"]}
 * This function deconstructs such array to confirm to
 * the MonitorTuples format
 * ex: [ ["set-cookie", "cookie-1"], ["set-cookie", "cookie-2"]]
 */
function headersToTuples(headers: object): MonitorTuples {
  let tuples: MonitorTuples = []
  Object.entries(headers ?? {}).map(([key, value]) => {
    if (Array.isArray(value)) {
      value.map((item) => {
        tuples.push([key, item])
      })
    } else {
      tuples.push([key, value])
    }
  })
  return tuples
}
