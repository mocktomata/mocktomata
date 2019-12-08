import { SpecRecord } from './types'

export function actionMatches(actual: SpecRecord.Action, expected: SpecRecord.Action | undefined) {
  switch (actual.type) {
    case 'get':
      return isMatchingGetAction(actual, expected)
    case 'invoke':
      return isMatchingInvokeAction(actual, expected)
  }
}

function isMatchingGetAction(
  actual: SpecRecord.GetAction,
  expected: SpecRecord.Action | undefined
): actual is SpecRecord.GetAction {
  return !!expected && expected.type === 'get' &&
    actual.refId === expected.refId &&
    actual.performer === expected.performer &&
    actual.key === expected.key
}

function isMatchingInvokeAction(
  actual: SpecRecord.InvokeAction,
  expected: SpecRecord.Action | undefined
): actual is SpecRecord.InvokeAction {
  return !!expected && expected.type === 'invoke' &&
    actual.refId === expected.refId &&
    actual.performer === expected.performer
  // TODO: check thisArg and payload
  // need to see how to compare subject/testDouble/Reference
}
