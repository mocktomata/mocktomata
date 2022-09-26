import type { SpecRecord } from '../spec-record/types.js'

export function hasProperty(subject: any, property: SpecRecord.SupportedKeyTypes): boolean {
  if (typeof property === 'string') {
    const propNames = Object.getOwnPropertyNames(subject)
    if (propNames.indexOf(property) >= 0) return true

    const proto = Object.getPrototypeOf(subject)
    return proto ? hasProperty(proto, property) : false
  }
  return false
}
