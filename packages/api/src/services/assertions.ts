import {
  MonitorResult,
  Monitor,
  MonitorAssertion,
  MonitorAssertionResult,
} from '@httpmon/db'

import { JSONPath } from 'jsonpath-plus'

/**
 *
 * @param assertion
 * @param resp
 * @returns error string or null for success
 */
function checkAssertion<T extends string | number>(
  assertion: MonitorAssertion,
  resp: T
): string | null {
  let target = assertion.value

  if (typeof resp == 'string') {
    switch (assertion.op) {
      case 'contains':
        return resp.includes(target) ? null : resp
      case 'matches':
        return resp.match(target) ? null : resp
    }
  }

  //takes advantage of JS string to numberic coertion
  switch (assertion.op) {
    case '=':
      return resp == target ? null : resp.toString()
    case '!=':
      return resp != target ? null : resp.toString()
    case '>':
      return resp > target ? null : resp.toString()
    case '<':
      return resp < target ? null : resp.toString()
  }

  return `unknown operator: ${assertion.op}`
}

/**
 * Applies assertions to the given monitor result
 * @returns assertionResults
 */
export function processAssertions(
  mon: Omit<Monitor, 'createdAt'>,
  monResult: Omit<MonitorResult, 'createdAt'>
) {
  let assertions = (mon.assertions ?? []) as MonitorAssertion[]

  let assertionResults = [] as MonitorAssertionResult[]

  for (let i = 0; i < assertions.length; i++) {
    //handle assertion
    let assertion = assertions[i]
    let resp: string | null = 'unknown failure'

    switch (assertion.type) {
      case 'code':
        resp = checkAssertion(assertion, monResult.code)
        break
      case 'totalTime':
        resp = checkAssertion(assertion, monResult.totalTime)
        break
      case 'certExpiryDays':
        resp = checkAssertion(assertion, monResult.certExpiryDays)
        break
      case 'header':
        if (Array.isArray(monResult.headers) && assertion.name) {
          const respHdrTuple = monResult.headers.find(
            (hdr) => hdr[0] == assertion.name
          )
          if (respHdrTuple) {
            resp = checkAssertion(assertion, respHdrTuple[1])
          } else resp = 'header not found'
        }
        break
      case 'body':
        let body = monResult.bodyJson
          ? JSON.stringify(monResult.bodyJson)
          : monResult.body
        resp = checkAssertion(assertion, body)
        break

      case 'jsonBody':
        if (monResult.bodyJson) {
          const path = assertion.name || ''
          const result = JSONPath({ path, json: monResult.bodyJson })
          console.log(path)
          console.log(result)
          if (typeof result == 'string' || typeof result == 'number') {
            resp = checkAssertion(assertion, result)
          } else {
            resp = 'jsonpath should only result in string or number values'
          }
        }
        break
    }

    assertionResults.push({
      ...assertion,
      //limit resp length if its too big like a body or long header
      fail: resp ? resp.substring(0, 128) : undefined,
    })
  }

  return assertionResults
}
