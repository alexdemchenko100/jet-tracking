import { MonitorResult, Monitor, MonitorAssertion } from '@httpmon/db'

export function processAssertions(
  mon: Omit<Monitor, 'createdAt'>,
  result: Omit<MonitorResult, 'createdAt'>
) {
  let assertions = (mon.assertions ?? []) as MonitorAssertion[]

  let success = false

  for (let i = 0; i < assertions.length; i++) {
    //handle assertion
    let assertion = assertions[i]

    if (assertion.key == 'code') {
      if (+assertion.value == result.code) {
        success = true
        break
      }
    }
  }

  return success
}
