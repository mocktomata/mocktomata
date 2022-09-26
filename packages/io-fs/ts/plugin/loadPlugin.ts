import { PluginNotFound, SpecPlugin } from '@mocktomata/framework'
import { log } from '../log.js'

export const ctx = { log }
export function loadPlugin(cwd: string, id: string): SpecPlugin.Module {
  try {
    const p = require.resolve(id, { paths: [cwd] })
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(p)
  }
  catch (e: any) {
    ctx.log.warn(`Unable to find plugin: ${id}`)
    throw new PluginNotFound(id)
  }
}
