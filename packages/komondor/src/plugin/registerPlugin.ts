import { PluginAlreadyLoaded } from './errors';
import { PluginActivationContext, PluginModule } from './interfaces';
import { store } from './store';


const activationContext: PluginActivationContext = {
  register(name, support, getSpy, getStub, serialize) {
    const plugins = store.get().plugins
    if (plugins.some(p => p.name === name)) {
      throw new PluginAlreadyLoaded(name)
    }

    plugins.unshift({ name, support, getSpy, getStub, serialize })
  }
}

export function registerPlugin(pluginModule: PluginModule) {
  pluginModule.activate(activationContext)
}
