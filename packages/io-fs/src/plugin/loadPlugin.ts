import { PluginModuleNotConforming, SpecPlugin, PluginNotFound } from '@mocktomata/framework'
import { log } from '../log'

export function loadPlugin(cwd: string, id: string): SpecPlugin.Module {
  try {
    const p = require.resolve(id, { paths: [cwd] })
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m = require(p)
    if (m && typeof m.activate === 'function') return m
  }
  catch (e) {
    log.warn(`Unable to find plugin: ${id}`);
    throw new PluginNotFound(id)
  }
  throw new PluginModuleNotConforming(id)
}
