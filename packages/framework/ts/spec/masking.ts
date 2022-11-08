import { reduceByKey } from 'type-plus'
import type { MaskCriterion } from './types.internal.js'

export function createMaskFn(criterion: MaskCriterion) {
  const filter = function (v: string) { return v === criterion.value }
  const replacer = createStringReplacer('[masked]')
  return (value: any) => {
    if (typeof value === 'string' && filter(value)) return replacer(value)

    return value
  }
}

function defaultStringReplacer(value: string) { return toMask(value) }

function createStringReplacer(replaceWith: string | ((value: string) => string) | undefined) {
  if (replaceWith === undefined) {
    return defaultStringReplacer
  }
  else if (typeof replaceWith === 'string') return function (_: string) { return replaceWith }
  return replaceWith
}

function toMask(value: string, maskChar = '*') {
  let len = value.length
  let result = ''
  while (len--) result += maskChar
  return result
}

export function maskValue<T extends string | number>(value: any, maskFn: (value: T) => T): any {
  if (isMaskSubject(value)) return maskFn(value)
  if (Array.isArray(value)) {
    return value.map(v => maskValue(v, maskFn))
  }
  if (typeof value === 'object' && value !== null) {
    return reduceByKey(value, (v, key) => {
      v[key] = maskValue(v[key], maskFn)
      return v
    }, value)
  }
  return value
}

export function isMaskSubject(value: any) {
  const type = typeof value
  return type === 'string' || type === 'number' || type === 'bigint'
}

export function maskIfNeeded(maskCriteria: MaskCriterion[], value: any) {
  if (maskCriteria.length === 0) return value
  return maskCriteria.reduce((value, criterion) => {
    const maskFn = createMaskFn(criterion)
    return maskValue(value, maskFn)
  }, value)
}
