import r from 'ramda'
import isPrimitive from 'is-primitive'

import { artifactKey } from './constants'

export function artifactify(original) {
  if (isPrimitive(original)) {
    return Object.defineProperty(Object(original), artifactKey, {
      enumerable: false,
      value: typeof original
    })
  }

  const type = Array.isArray(original) ? 'array' : 'object'
  const clone = r.clone(original)
  return new Proxy(clone as any, {
    get(obj, prop) {
      if (prop === artifactKey) return type
      const result = obj[prop]
      if (result === undefined ||
        result[artifactKey]
      ) return result

      const desc = Object.getOwnPropertyDescriptor(obj, prop)
      if (desc && !desc.writable) return result

      return obj[prop] = artifactify(result)
    }
  })
}

export function unartifactify(value) {
  if (value === undefined || value === null) return value

  switch (value[artifactKey]) {
    case 'string':
      return String(value)
    case 'boolean':
      // tslint:disable-next-line:triple-equals
      return value == true
    case 'number':
      return Number(value)
    case 'array':
      return value.map(v => unartifactify(v))
    case 'object':
      return r.map(unartifactify, value)
    default:
      if (Array.isArray(value)) {
        return value.map(v => unartifactify(v))
      }
      // istanbul ignore next
      return value
  }
}
