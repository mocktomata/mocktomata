import { SupportedKeyTypes } from '../spec'

export function hasProperty(subject: any, property: SupportedKeyTypes): boolean {
  if (typeof property === 'string') {
    const propNames = Object.getOwnPropertyNames(subject)
    if (propNames.indexOf(property) >= 0) return true

    const proto = Object.getPrototypeOf(subject)
    return proto ? hasProperty(proto, property) : false
  }
  return false
}
