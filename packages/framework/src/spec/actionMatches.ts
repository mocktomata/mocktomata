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
  // extra action
  if (!expected) return false
  // wrong type
  if (expected.type !== 'set') return false

  if (actual.refId !== expected.refId || actual.performer !== expected.performer || actual.key !== expected.key) return false

  // compare primitive values
  if (typeof expected.value !== 'string') return actual.value === expected.value

  // don't care about actual value if expectation is inert
  const expectedRef = record.getLoadedRef(expected.value)
  if (expectedRef?.inert) return true

  const actualRef = record.getRef(actual.value)

  // ignore function, class, object, and array
  if (!isPrimitive(actualRef?.subject)) return true
  // cheat a bit. only string|undefined goes here,
  // which comparing meta would work
  return actualRef?.meta === expectedRef?.meta
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
      if (a === expectedPayload[i]) return true

      // ignore inert value
      const ref = record.getLoadedRef(expectedPayload[i])
      return ref?.inert
    })
}
