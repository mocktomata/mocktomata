import { artifactify } from './artifactify'
import { MissingArtifact } from './errors'
import { store } from './store'

/**
 * create an artifact out of the original value.
 * Note that artifact object cannot be used in enumerating comparision,
 * such as `t.deepStrictEqual()`.
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
  return store.artifacts[id] = artifactify(original)
}

export function overruleArtifact<T>(id: string, override: T): T {
  return store.defaultArtifacts[id] = artifactify(override)
}
