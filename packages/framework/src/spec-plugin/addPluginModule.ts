import { log } from '../log'
import { store } from '../store'
import { DuplicatePlugin, PluginNotConforming } from './errors'
import { SpecPlugin } from './types'

// TODO: this might need to be convert to async function so that the module
// can call register asynchronously
export function addPluginModule(moduleName: string, pluginModule: SpecPlugin.Module) {
  const ps: SpecPlugin.Instance[] = []

  if (!pluginModule) {
    log.warn(`${moduleName} is not a valid plugin module.`)
    return ps
  }
  if (typeof pluginModule.activate !== 'function') {
    log.warn(`${moduleName} does not export an 'activate()' function.`)
    return ps
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
      ps.unshift({ ...plugin, name: pluginName })
    }
  })

  return ps
}

function assertPluginConfirming(plugin: any) {
  if (!plugin ||
    typeof plugin.support !== 'function' ||
    typeof plugin.createSpy !== 'function' ||
    typeof plugin.createStub !== 'function'
  )
    throw new PluginNotConforming(plugin.name)
}
