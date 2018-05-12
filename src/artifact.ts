import r from 'ramda'
import { isPrimitive } from 'util'

import { artifactKey } from './constants'
import { store } from './store'
import { MissingArtifact } from '.';

/**
 * create an artifact out of the original value.
 * Note that artifact object cannot be used in enumerating comparision,
 * such as `t.deepEqual()`.
 * @param original original value. It should be simple object (think struct)
 */
export function artifact<T = any>(id: string, original?: T): T {
  const defaultArtifact = store.defaultArtifacts[id]
  if (defaultArtifact !== undefined)
    return defaultArtifact

  if (original === undefined) {
    const a = store.artifacts[id]
    if (a === undefined)
      throw new MissingArtifact(id)
    return a
  }
  return store.artifacts[id] = createArtifact(original)
}

export function overruleArtifact<T>(id: string, override: T): T {
  return store.defaultArtifacts[id] = createArtifact(override)
}

function createArtifact(original) {
  // TODO: remove usage of `isPrimitive()`
  // `isPrimitive()` is NodeJS only.
  // So this does not work on browser.
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

      return obj[prop] = createArtifact(result)
    }
  })
}
