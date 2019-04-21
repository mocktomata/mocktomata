import { NoActivate, PluginNotFound, DuplicatePlugin, PluginNotConforming } from './errors';
import { KomondorPlugin, PluginIO, PluginModule } from './types';
import { store } from '../store';

export type LoadPluginContext = {
  io: PluginIO
}

/**
 * Load plugins to the system.
 */
export async function loadPlugins({ io }: LoadPluginContext) {
  const pluginNames = await io.getPluginList()
  return Promise.all(pluginNames.map(name => loadPlugin({ io }, name)))
}

export async function loadPlugin({ io }: LoadPluginContext, moduleName: string) {
  const pluginModule = await tryLoad({ io }, moduleName)
  assertModuleConfirming(moduleName, pluginModule)

  pluginModule.activate({
    register(plugin: KomondorPlugin) {
      assertPluginConfirming(plugin)
      const pluginName = plugin.name ? `${moduleName}/${plugin.name}` : moduleName
      const plugins = store.get().plugins
      if (plugins.some(p => p.name === pluginName)) {
        throw new DuplicatePlugin(pluginName)
      }

      plugins.unshift({ ...plugin, name: pluginName })
    }
  })

}
async function tryLoad({ io }: LoadPluginContext, name: string) {
  try {
    return await io.loadPlugin(name)
  }
  catch {
    throw new PluginNotFound(name)
  }
}

function assertModuleConfirming(moduleName: string, pluginModule: Partial<PluginModule>) {
  if (typeof pluginModule.activate !== 'function') {
    throw new NoActivate(moduleName)
  }
}

function assertPluginConfirming(plugin: any) {
  if (
    !plugin ||
    typeof plugin.support !== 'function' ||
    typeof plugin.getSpy !== 'function' ||
    typeof plugin.getStub !== 'function'
  )
    throw new PluginNotConforming(plugin.name)
}
