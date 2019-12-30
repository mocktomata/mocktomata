import { SpecMode } from '@mocktomata/framework'
import { MocktomataStore } from '../store'

/**
 * Get the effective SpecMode for the specified id.
 * @param mode The SpecMode to return if SpecMode is not changed by config.
 */
export function getEffectiveSpecMode(
  storeValue: Pick<MocktomataStore, 'overrideMode' | 'filePathFilter' | 'specNameFilter'>,
  mode: SpecMode,
  specName: string,
  invokePath: string,
): SpecMode {
  if (mode !== 'auto') return mode

  const overrideMode = storeValue.overrideMode
  if (!overrideMode) return mode

  if (storeValue.filePathFilter && !storeValue.filePathFilter.test(invokePath)) return mode

  if (storeValue.specNameFilter && !storeValue.specNameFilter.test(specName)) return mode

  return overrideMode
}
