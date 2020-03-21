import { SpecRecord } from '../spec-record/types'
import { SpecRecordValidator } from './record'

export function isMatchingGetAction(
  actual: SpecRecord.GetAction,
  expected: SpecRecord.Action | undefined
): actual is SpecRecord.GetAction {
  return !!expected && expected.type === 'get' &&
    actual.refId === expected.refId &&
    actual.performer === expected.performer &&
    actual.key === expected.key
}

export function isMatchingSetAction(
  record: SpecRecordValidator,
  actual: SpecRecord.SetAction,
  expected: SpecRecord.Action
): actual is SpecRecord.SetAction {
  // wrong type
  if (expected.type !== 'set') return false

  if (actual.refId !== expected.refId || actual.performer !== expected.performer || actual.key !== expected.key) return false

  // compare primitive values
  if (typeof expected.value !== 'string') return actual.value === expected.value

  // don't care about actual value if expectation is inert
  const expectedRef = record.getLoadedRef(expected.value)
  if (expectedRef?.inert) return true

  // actual is primitive value but expected is not primitive or not inert
  if (typeof actual.value !== 'string') return false

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

export function isMatchingInvokeAction(
  record: SpecRecordValidator,
  actual: SpecRecord.InvokeAction,
  expected: SpecRecord.Action
): actual is SpecRecord.InvokeAction {
  return expected.type === 'invoke' &&
    actual.refId === expected.refId &&
    actual.performer === expected.performer &&
    actual.thisArg === expected.thisArg &&
    isMatchingPayload(record, actual.payload, expected.payload)
}

export function isMatchingInstantiateAction(
  record: SpecRecordValidator,
  actual: SpecRecord.InstantiateAction,
  expected: SpecRecord.Action
): actual is SpecRecord.InstantiateAction {
  return expected.type === 'instantiate' &&
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
