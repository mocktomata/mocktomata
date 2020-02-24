import { Spec } from '../spec'

/**
 * Get the effective SpecMode for the specified id.
 * @param mode The SpecMode to return if SpecMode is not changed by config.
 */
export function getEffectiveSpecMode(
  config: Spec.Config,
  mode: Spec.Mode,
  specName: string,
  invokePath: string,
): Spec.Mode {
  if (mode !== 'auto') return mode

  const overrideMode = config.overrideMode
  if (!overrideMode) return mode

  if (config.filePathFilter && !config.filePathFilter.test(invokePath)) return mode

  if (config.specNameFilter && !config.specNameFilter.test(specName)) return mode

  return overrideMode
}
