import {
  MonitorResult,
  Monitor,
  MonitorAssertion,
  MonitorAssertionResult,
} from '@httpmon/db'

function checkAssertion(assertion: MonitorAssertion, respNum: number) {
  let targetNum = +assertion.value
  let passed = false
  switch (assertion.op) {
    case '=':
      passed = respNum == targetNum
      break
    case '!=':
      passed = respNum != targetNum
      break
    case '>':
      passed = respNum > targetNum
      break
    case '<':
      passed = respNum < targetNum
      break
  }
  return passed
}

export function processAssertions(
  mon: Omit<Monitor, 'createdAt'>,
  monResult: Omit<MonitorResult, 'createdAt'>
) {
  let assertions = (mon.assertions ?? []) as MonitorAssertion[]

  let assertionResults = [] as MonitorAssertionResult[]

  for (let i = 0; i < assertions.length; i++) {
    //handle assertion
    let assertion = assertions[i]
    let passed = false
    let result = 0

    switch (assertion.key) {
      case 'code':
        result = monResult.code
        passed = checkAssertion(assertion, monResult.code)
        break
      case 'totalTime':
        result = monResult.totalTime
        passed = checkAssertion(assertion, monResult.totalTime)
        break
      case 'certExpiryDays':
        result = monResult.certExpiryDays
        passed = checkAssertion(assertion, monResult.certExpiryDays)
        break
    }

    assertionResults.push({
      ...assertion,
      passed: passed,
      result: result.toString(),
    })
  }

  return assertionResults
}
