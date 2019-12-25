import { SpecRecord } from './types'

export function actionMatches(actual: SpecRecord.Action, expected: SpecRecord.Action | undefined) {
  switch (actual.type) {
    case 'get':
      return isMatchingGetAction(actual, expected)
    case 'set':
      return isMatchingSetAction(actual, expected)
    case 'invoke':
      return isMatchingInvokeAction(actual, expected)
    case 'instantiate':
      return isMatchingInstantiateAction(actual, expected)
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

function isMatchingSetAction(
  actual: SpecRecord.SetAction,
  expected: SpecRecord.Action | undefined
): actual is SpecRecord.SetAction {
  return !!expected && expected.type === 'set' &&
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
    actual.performer === expected.performer &&
    actual.thisArg === expected.thisArg &&
    actual.payload.length === expected.payload.length &&
    actual.payload.every((a, i) => a === expected.payload[i])
}

function isMatchingInstantiateAction(
  actual: SpecRecord.InstantiateAction,
  expected: SpecRecord.Action | undefined
): actual is SpecRecord.InstantiateAction {
  return !!expected && expected.type === 'instantiate' &&
    actual.refId === expected.refId &&
    actual.performer === expected.performer
}
