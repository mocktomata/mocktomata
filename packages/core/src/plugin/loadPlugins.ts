import { addPluginModule } from './addPluginModule';
import { PluginNotFound } from './errors';
import { LoadPluginContext } from './typesInternal';

/**
 * Load plugins to the system.
 */
export async function loadPlugins({ io }: LoadPluginContext) {
  const pluginNames = await io.getPluginList()
  return Promise.all(pluginNames.map(name => loadPlugin({ io }, name)))
}

export async function loadPlugin({ io }: LoadPluginContext, moduleName: string) {
  const pluginModule = await tryLoad({ io }, moduleName)
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
