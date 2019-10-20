import { SpecMode } from './types';
import { store } from '../store'

/**
 * Get the effective SpecMode for the specified id.
 * @param defaultMode The default SpecMode to return if SpecMode is not changed by config for the specified id.
 */
export function getEffectiveSpecMode(specName: string, invokePath: string, defaultMode: SpecMode): SpecMode {
  // TODO: spec filter not supporting windows environment
  const id = `${invokePath}/${specName}`
  const override = store.value.specOverrides.find(s => {
    if (typeof s.filter === 'string')
      return s.filter === id
    else
      return s.filter.test(id)
  })
  return override ? override.mode :
    store.value.specDefaultMode || defaultMode
}
