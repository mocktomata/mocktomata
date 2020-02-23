import { SpecRecord } from '../spec-record/types'

export function referenceMismatch(actual: SpecRecord.Reference, expected: SpecRecord.Reference) {
  return !(actual.plugin === expected.plugin && !sourceMismatch(actual.source, expected.source))
}

function sourceMismatch(actual: SpecRecord.ReferenceSource | undefined, expected: SpecRecord.ReferenceSource | undefined) {
  if (actual === undefined) {
    return expected !== undefined
  }
  return expected === undefined ||
    actual.id !== expected.id ||
    (actual as any).key !== (expected as any).key
}

export function siteMismatch(actual: SpecRecord.SupportedKeyTypes | undefined, expected: SpecRecord.SupportedKeyTypes | undefined) {
  return actual === expected
}

export function arrayMismatch(actual: any[] | undefined, expected: any[] | undefined) {
  if (actual === undefined) {
    return expected !== undefined
  }
  return expected === undefined ||
    actual.length !== expected.length ||
    actual.some((v, i) => v !== expected[i])
}
