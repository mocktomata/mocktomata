import { addPluginModule } from './addPluginModule'
import { PluginNotFound } from './errors'
import { SpecPlugin } from './types'
import { store } from '../store'

export namespace loadPlugins {
  export type Context = {
    io: SpecPlugin.IO
  }
}

/**
 * Load plugins to the system.
 */
export async function loadPlugins({ io }: loadPlugins.Context): Promise<SpecPlugin.Instance[]> {
  const pluginNames = await (await io.getConfig()).plugins
  return Promise.all(pluginNames.map(name => loadPlugin(io, name))).then(() => store.value.plugins)
}

async function loadPlugin(io: SpecPlugin.IO, moduleName: string) {
  const pluginModule = await tryLoad(io, moduleName)
  addPluginModule(moduleName, pluginModule)
}
async function tryLoad(io: SpecPlugin.IO, name: string) {
  try {
    return await io.loadPlugin(name)
  }
  catch (e) {
    throw new PluginNotFound(name)
  }
}
