import { PluginAlreadyLoaded, PluginNotConforming } from './errors';
import { getPlugins } from './getPlugins';
import { KomondorPlugin, PluginInstance, PluginModule } from './interfaces';

export function registerPlugin(pluginName: string, pluginModule: PluginModule) {
  assertModuleConfirming(pluginName, pluginModule)
  pluginModule.activate({
    register(plugin: Partial<KomondorPlugin<any>>) {
      const p = createInstance(pluginName, plugin)
      const plugins = getPlugins()
      if (plugins.some(p => p.name === pluginName)) {
        throw new PluginAlreadyLoaded(pluginName)
      }

      plugins.unshift(p)
    }
  })
}

function assertModuleConfirming(pluginName: string, pluginModule: Partial<PluginModule>) {
  if (typeof pluginModule.activate !== 'function') {
    throw new PluginNotConforming(pluginName)
  }
}

function createInstance(name: string, plugin: Partial<KomondorPlugin<any>>): PluginInstance {
  if (!(plugin.getSpy && plugin.getStub && plugin.support)) {
    throw new PluginNotConforming(name)
  }

  return { ...plugin, name } as any
}
