import { log } from '../log'
import { DuplicatePlugin, PluginNotConforming } from './errors'
import { SpecPlugin } from './types'

// TODO: this might need to be convert to async function so that the module
// can call register asynchronously
export function addPluginModule(plugins: SpecPlugin.Instance[], moduleName: string, pluginModule: SpecPlugin.Module) {
  if (typeof pluginModule.activate !== 'function') {
    log.warn(`${moduleName} does not export an 'activate()' function.`)
    return plugins
  }

  pluginModule.activate({
    register(plugin: SpecPlugin) {
      assertPluginConfirming(plugin)
      const pluginName = plugin.name ? `${moduleName}/${plugin.name}` : moduleName
      if (plugins.some(p => p.name === pluginName)) {
        throw new DuplicatePlugin(pluginName)
      }

      plugins.unshift({ ...plugin, name: pluginName })
    }
  })

  return plugins
}

function assertPluginConfirming(plugin: any) {
  if (!plugin ||
    typeof plugin.support !== 'function' ||
    typeof plugin.createSpy !== 'function' ||
    typeof plugin.createStub !== 'function'
  )
    throw new PluginNotConforming(plugin.name)
}
