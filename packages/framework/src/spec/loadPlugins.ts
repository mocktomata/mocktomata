import { store } from '../store';
import { DuplicatePlugin, NoActivate, PluginNotConforming, PluginNotFound } from './errors';
import { SpecPlugin, SpecPluginModule } from './types';
import { PluginIO } from './types-internal';

export type LoadPluginContext = {
  io: PluginIO
}

/**
 * Load plugins to the system.
 */
export async function loadPlugins({ io }: LoadPluginContext): Promise<void> {
  const pluginNames = await io.getPluginList()
  return Promise.all(pluginNames.map(name => loadPlugin({ io }, name))).then(() => {})
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

export function addPluginModule(moduleName: string, pluginModule: SpecPluginModule) {
  assertModuleConfirming(moduleName, pluginModule)

  pluginModule.activate({
    register(plugin: SpecPlugin) {
      assertPluginConfirming(plugin)
      const pluginName = plugin.name ? `${moduleName}/${plugin.name}` : moduleName
      const plugins = store.value.plugins
      if (plugins.some(p => p.name === pluginName)) {
        throw new DuplicatePlugin(pluginName)
      }

      plugins.unshift({ ...plugin, name: pluginName })
    }
  })
}

function assertModuleConfirming(moduleName: string, pluginModule: Partial<SpecPluginModule>) {
  if (typeof pluginModule.activate !== 'function') {
    throw new NoActivate(moduleName)
  }
}

function assertPluginConfirming(plugin: any) {
  if (
    !plugin ||
    typeof plugin.support !== 'function' ||
    typeof plugin.createSpy !== 'function' ||
    typeof plugin.createStub !== 'function'
  )
    throw new PluginNotConforming(plugin.name)
}
