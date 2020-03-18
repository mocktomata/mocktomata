import { SpecRecord } from '../spec-record/types'
import { SpecRecordValidator } from './record'

export function actionMatches(record: SpecRecordValidator, actual: SpecRecord.Action, expected: SpecRecord.Action | undefined) {
  switch (actual.type) {
    case 'get':
      return isMatchingGetAction(actual, expected)
    case 'set':
      return isMatchingSetAction(record, actual, expected)
    case 'invoke':
      return isMatchingInvokeAction(record, actual, expected)
    case 'instantiate':
      return isMatchingInstantiateAction(record, actual, expected)
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
  record: SpecRecordValidator,
  actual: SpecRecord.SetAction,
  expected: SpecRecord.Action | undefined
): actual is SpecRecord.SetAction {
  return !!expected && expected.type === 'set' &&
    actual.refId === expected.refId &&
    actual.performer === expected.performer &&
    actual.key === expected.key &&
    (!isPrimitive(expected.value) || expected.value === actual.value)
}
function isPrimitive(value: any) {
  return typeof value !== 'object' && typeof value !== 'function'
}

function isMatchingInvokeAction(
  record: SpecRecordValidator,
  actual: SpecRecord.InvokeAction,
  expected: SpecRecord.Action | undefined
): actual is SpecRecord.InvokeAction {
  return !!expected && expected.type === 'invoke' &&
    actual.refId === expected.refId &&
    actual.performer === expected.performer &&
    actual.thisArg === expected.thisArg &&
    isMatchingPayload(record, actual.payload, expected.payload)
}

function isMatchingInstantiateAction(
  record: SpecRecordValidator,
  actual: SpecRecord.InstantiateAction,
  expected: SpecRecord.Action | undefined
): actual is SpecRecord.InstantiateAction {
  return !!expected && expected.type === 'instantiate' &&
    actual.refId === expected.refId &&
    actual.performer === expected.performer &&
    isMatchingPayload(record, actual.payload, expected.payload)
}

function isMatchingPayload(record: SpecRecordValidator, actualPayload: any[], expectedPayload: any[]) {
  return actualPayload.length === expectedPayload.length &&
  actualPayload.every((a, i) => {
    // this compare already compares ref as the values are refId (string)
    if (a === expectedPayload[i]) return true

    // ignore inert value
    const ref = record.getLoadedRef(expectedPayload[i])
    return ref?.inert
  })
}
