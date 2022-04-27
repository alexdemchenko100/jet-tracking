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
        resp = checkAssertion(assertion, monResult.body)
        break

      case 'jsonBody':
        let bodyJson = ''

        try {
          bodyJson = JSON.parse(monResult.body)
          const path = assertion.name || ''
          const result = JSONPath({
            path,
            json: bodyJson,
            wrap: false,
          })

          if (typeof result === 'string') {
            resp = checkAssertion(assertion, result)
          } else {
            resp = checkAssertion(assertion, JSON.stringify(result))
          }
        } catch (e) {}
        break
    }

    assertionResults.push({
      ...assertion,
      //limit resp length if its too big like a body or long header
      fail: resp ? resp.substring(0, 256) : undefined,
    })
  }

  return assertionResults
}

//format assertion results as a string

//format assertion result as a string
function formatAssertResult(a: MonitorAssertionResult) {
  if (a.fail) {
    return `${a.type} ${a.name || ''} ${a.op} ${a.value} failed with: ${a.fail}`
  }
  return ''
}

export function formatAssertionResults(result: MonitorResult) {
  if (!result.assertResults || typeof result.assertResults === 'string')
    return ''

  const bfailed = result.assertResults.some((a) => a.fail)
  if (!bfailed) return ''

  let assertionResults = result.assertResults ?? []
  let s = ''
  for (let i = 0; i < assertionResults.length; i++) {
    s += formatAssertResult(assertionResults[i])
  }
  return s
}
