import { reduceKey } from 'type-plus'
import { MaskCriterion, MaskNumberCriterion, MaskStringCriterion, MaskRegExpCriterion } from './types-internal.js'

export function createMaskFn(criterion: MaskCriterion) {
  if (isNumberCriterion(criterion)) {
    const replacer = createNumberReplacer(criterion.replaceWith)
    return (value: any) => {
      if (value === criterion.value) return replacer(value)
      // istanbul ignore next
      if (typeof value === 'bigint') {
        const v = Number(value)
        if (v === criterion.value) return replacer(v)
      }
      return value
    }
  }
  else if (isStringCriterion(criterion)) {
    const filter = function (v: string) { return v === criterion.value }
    const replacer = createStringReplacer(criterion.replaceWith)
    return (value: any) => {
      if (typeof value === 'string' && filter(value)) return replacer(value)

      return value
    }
  }
  else if (isRegExpCriterion(criterion)) {
    const filter = function (v: string) { return (criterion.value as RegExp).exec(v) }
    const replacer = createRegExpReplacer(criterion.replaceWith)
    return (value: any) => {
      if (typeof value === 'string') {
        const matches = filter(value)
        return matches ? replacer(matches) : value
      }
      return value
    }
  }
  else {
    const filter = criterion.value
    const replacer = typeof criterion.replaceWith === 'function' ?
      criterion.replaceWith :
      criterion.replaceWith !== undefined ?
        function (_: number | string) { return criterion.replaceWith } :
        function (value: number | string) {
          return typeof value === 'string' ? defaultStringReplacer(value) : defaultNumberReplacer(value)
        }
    return (value: any) => {
      return filter(value) ? replacer(value) : value
    }
  }
}

function isNumberCriterion(criterion: MaskCriterion): criterion is MaskNumberCriterion {
  return typeof criterion.value === 'number'
}
function defaultNumberReplacer(value: number) {
  return Number(toMask(Math.trunc(Number(value)).toString(), '7'))
}
function createNumberReplacer(replaceWith: number | ((value: number) => number) | undefined) {
  if (replaceWith === undefined) {
    return defaultNumberReplacer
  }
  else if (typeof replaceWith === 'number') {
    return function (_: number) { return replaceWith }
  }
  return function (v: number) { return replaceWith(v) }
}

function isStringCriterion(criterion: MaskCriterion): criterion is MaskStringCriterion {
  return typeof criterion.value === 'string'
}

function defaultStringReplacer(value: string) { return toMask(value) }

function createStringReplacer(replaceWith: string | ((value: string) => string) | undefined) {
  if (replaceWith === undefined) {
    return defaultStringReplacer
  }
  else if (typeof replaceWith === 'string') return function (_: string) { return replaceWith }
  return replaceWith
}

function isRegExpCriterion(criterion: MaskCriterion): criterion is MaskRegExpCriterion {
  return typeof criterion.value === 'object'
}
function createRegExpReplacer(replaceWith: string | ((value: RegExpExecArray) => string) | undefined) {
  if (replaceWith === undefined) {
    return function (value: RegExpMatchArray) {
      return value.input!.replace(value[0], toMask(value[0]))
    }
  }
  else if (typeof replaceWith === 'string') {
    return function (value: RegExpMatchArray) {
      return value.input!.replace(value[0], replaceWith)
    }
  }
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
  if (typeof value === 'object') {
    return reduceKey(value, (v, key) => {
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
