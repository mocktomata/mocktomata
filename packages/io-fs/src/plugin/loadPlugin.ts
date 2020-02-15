import { SpecPlugin, PluginModuleNotConforming } from '@mocktomata/framework'

export function loadPlugin(cwd: string, id: string): SpecPlugin.Module {
  try {
    const p = require.resolve(id, { paths: [cwd] })
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m = require(p)
    if (m && typeof m.activate === 'function') return m
  }
  catch (e) {
    // istanbul ignore next
    if (e.code !== 'MODULE_NOT_FOUND') throw e
  }
  throw new PluginModuleNotConforming(id)
}
