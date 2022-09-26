import { PluginModuleNotConforming, SpecPlugin, PluginNotFound } from '@mocktomata/framework'
import { log } from '../log.js'

export const ctx = { log }
export function loadPlugin(cwd: string, id: string): SpecPlugin.Module {
  try {
    const p = require.resolve(id, { paths: [cwd] })
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m = require(p)

    // TODO: move this to framework.
    // Framework is the one who determine if the module loaded valid or not.
    // Having this code here means the same code needs to exist in `io-client`
    if (m && typeof m.activate === 'function') return m
  }
  catch (e: any) {
    ctx.log.warn(`Unable to find plugin: ${id}`)
    throw new PluginNotFound(id)
  }
  throw new PluginModuleNotConforming(id)
}
