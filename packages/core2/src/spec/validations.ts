import { SpecReference, ReferenceSource } from './types';

export function referenceMismatch(actual: SpecReference, expected: SpecReference) {
  return !(actual.plugin === expected.plugin && !sourceMismatch(actual.source, expected.source))
}

function sourceMismatch(actual: ReferenceSource | undefined, expected: ReferenceSource | undefined) {
  if (actual === undefined) {
    return expected !== undefined
  }
  return expected === undefined ||
    actual.ref !== expected.ref ||
    siteMismatch(actual.site, expected.site)
}

export function siteMismatch(actual: Array<string | number> | undefined, expected: Array<string | number> | undefined) {
  return arrayMismatch(actual, expected)
}

export function arrayMismatch(actual: any[] | undefined, expected: any[] | undefined) {
  if (actual === undefined) {
    return expected !== undefined
  }
  return expected === undefined ||
    actual.length !== expected.length ||
    actual.some((v, i) => v !== expected[i])
}
