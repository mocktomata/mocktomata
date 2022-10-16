import type { Spec } from './types.js'

export function getEffectiveSpecModeContext(mode?: Spec.Mode) {
  return mode ? { mode } : function (ctx: {
    config: Spec.Context['config'],
    specName: string,
    specRelativePath: string,
  }) {
    return { mode: getEffectiveSpecMode(ctx.config, ctx.specName, ctx.specRelativePath) }
  }
}

/**
 * Get the effective SpecMode for the specified id.
 * @param mode The SpecMode to return if SpecMode is not changed by config.
 */
export function getEffectiveSpecMode(
  config: Spec.Context['config'],
  specName: string,
  invokePath: string,
): Spec.Mode {
  const overrideMode = config.overrideMode
  if (!overrideMode) return 'auto'
  if (config.filePathFilter && !config.filePathFilter.test(invokePath)) return 'auto'
  if (config.specNameFilter && !config.specNameFilter.test(specName)) return 'auto'

  return overrideMode
}
