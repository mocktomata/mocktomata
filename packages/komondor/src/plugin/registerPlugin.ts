import { DuplicatePlugin } from './errors';
import { PluginActivationContext } from './interfaces';
import { store } from './store';

const plugins = store.get().plugins

const activationContext: PluginActivationContext = {
  register(type, support, getSpy, getStub, serialize) {
    if (plugins.some(p => p.type === type)) {
      throw new DuplicatePlugin(type)
    }

    plugins.unshift({ type, support, getSpy, getStub, serialize })
  }
}

export function registerPlugin(plugin: { activate: (activationContext: PluginActivationContext) => void }) {
  plugin.activate(activationContext)
}
