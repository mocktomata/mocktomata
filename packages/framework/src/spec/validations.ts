import { SpecRecord } from './types'

export function referenceMismatch(actual: SpecRecord.Reference, expected: SpecRecord.Reference) {
  return !(actual.plugin === expected.plugin && !sourceMismatch(actual.source, expected.source))
}

function sourceMismatch(actual: SpecRecord.ReferenceSource | undefined, expected: SpecRecord.ReferenceSource | undefined) {
  if (actual === undefined) {
    return expected !== undefined
  }
  return expected === undefined ||
    actual.actionId !== expected.actionId ||
    siteMismatch(actual.site, expected.site)
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
