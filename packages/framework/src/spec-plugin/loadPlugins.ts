import { addPluginModule } from './addPluginModule'
import { PluginNotFound } from './errors'
import { SpecPlugin } from './types'

export type LoadPluginContext = {
  io: SpecPlugin.IO
}

/**
 * Load plugins to the system.
 */
export async function loadPlugins({ io }: LoadPluginContext): Promise<void> {
  const pluginNames = await (await io.getConfig()).plugins
  return Promise.all(pluginNames.map(name => loadPlugin({ io }, name))).then(() => { })
}

async function loadPlugin(context: LoadPluginContext, moduleName: string) {
  const pluginModule = await tryLoad(context, moduleName)
  addPluginModule(moduleName, pluginModule)
}
async function tryLoad({ io }: LoadPluginContext, name: string) {
  try {
    return await io.loadPlugin(name)
  }
  catch (e) {
    throw new PluginNotFound(name)
  }
}
