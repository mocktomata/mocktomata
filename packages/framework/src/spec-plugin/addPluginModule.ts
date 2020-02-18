import { log } from '../log'
import { store } from '../store'
import { DuplicatePlugin, PluginNotConforming } from './errors'
import { SpecPlugin } from './types'

export function addPluginModule(moduleName: string, pluginModule: SpecPlugin.Module) {
  if (!pluginModule) {
    log.warn(`${moduleName} is not a valid plugin module.`)
    return
  }
  if (typeof pluginModule.activate !== 'function') {
    log.warn(`${moduleName} does not export an 'activate()' function.`)
    return
  }

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

function assertPluginConfirming(plugin: any) {
  if (!plugin ||
    typeof plugin.support !== 'function' ||
    typeof plugin.createSpy !== 'function' ||
    typeof plugin.createStub !== 'function'
  )
    throw new PluginNotConforming(plugin.name)
}
