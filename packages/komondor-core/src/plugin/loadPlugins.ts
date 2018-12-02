// TODO: remove workaround for karma-typescript
// import '@komondor/plugin-fixture-deep-link/pluginA'
// import '@komondor/plugin-fixture-dummy'
// import '@komondor/plugin-fixture-no-activate'

import { PluginAlreadyLoaded, PluginNotConforming, PluginNotExist } from './errors';
import { getPlugins } from './getPlugins';
import { Registrar } from './Registrar';

// istanbul ignore next
export function loadPlugins(plugins: string[]) {
  plugins.map(loadPlugin)
}

function loadPlugin(pluginName: string) {
  const m = tryImport(pluginName)
  if (typeof m.activate !== 'function') {
    throw new PluginNotConforming(pluginName)
  }
  activatePlugin(m)
}

function tryImport(pluginName: string) {
  try {
    // TODO: add README about bundling komondor with plugins
    // Doing this rename because karma-typescript tries to load 'pluginPath' module when there is `require(pluginPath)`
    // That's a bug of karma-typescript.
    return require(pluginName + '')
  }
  catch {
    throw new PluginNotExist(pluginName)
  }
}

function activatePlugin(plugin: { activate: (registrar: Registrar) => void }) {
  plugin.activate(komondorRegistrar)
}

const komondorRegistrar: Registrar = {
  register(name: string, support, getSpy, getStub, serialize) {
    const plugins = getPlugins()
    if (plugins.some(p => p.name === name)) {
      throw new PluginAlreadyLoaded(name)
    }

    plugins.unshift({ name, support, getSpy, getStub, serialize })
  }
}
