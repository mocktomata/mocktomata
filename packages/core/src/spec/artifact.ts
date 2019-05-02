import { artifactify } from './artifactify'
import { MissingArtifact } from './errors'
import { store } from './store'
import { artifactKey } from './constants';
import { RecursiveIntersect } from 'type-plus';

/**
 * create an artifact out of the original value.
 * Note that artifact object cannot be used in enumerating comparision,
 * such as `t.deepStrictEqual()`.
 * @param original original value. It should be simple object (think struct)
 */
export function artifact<T = any>(id: string, original?: T): RecursiveIntersect<T, { [artifactKey]: string }> {
  const { artifacts, defaultArtifacts } = store.get()
  const defaultArtifact = defaultArtifacts[id]
  if (defaultArtifact !== undefined)
    return defaultArtifact

  if (original === undefined) {
    const a = artifacts[id]
    if (a === undefined)
      throw new MissingArtifact(id)
    return a
  }
  return artifacts[id] = artifactify(original)
}

export function overruleArtifact<T>(id: string, override: T): T {
  const { defaultArtifacts } = store.get()
  return defaultArtifacts[id] = artifactify(override)
}
