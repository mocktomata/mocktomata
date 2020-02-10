import { Spec } from '@mocktomata/framework'
import { WorkerStore } from '../types'

/**
 * Get the effective SpecMode for the specified id.
 * @param mode The SpecMode to return if SpecMode is not changed by config.
 */
export function getEffectiveSpecMode(
  storeValue: Pick<WorkerStore, 'overrideMode' | 'filePathFilter' | 'specNameFilter'>,
  mode: Spec.Mode,
  specName: string,
  invokePath: string,
): Spec.Mode {
  if (mode !== 'auto') return mode

  const overrideMode = storeValue.overrideMode
  if (!overrideMode) return mode

  if (storeValue.filePathFilter && !storeValue.filePathFilter.test(invokePath)) return mode

  if (storeValue.specNameFilter && !storeValue.specNameFilter.test(specName)) return mode

  return overrideMode
}
