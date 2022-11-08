import { reduceByKey } from 'type-plus'
import type { MaskCriterion } from './types.internal.js'

export function createMaskFn({ value }: MaskCriterion) {
  function replacer(v: any) {
    switch (true) {
      case typeof v === 'string': {
        let x = v as string
        while (x.indexOf(value) >= 0) {
          x = x.replace(value, '[masked]')
        }
        return x
      }
      case Array.isArray(v): {
        return v.map(replacer)
      }
      case typeof v === 'object' && v !== null: {
        return reduceByKey(v, (p, k) => {
          p[k] = replacer(v[k])
          return p
        }, {} as typeof v)
      }
      default: return v
    }
  }
  return replacer
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
