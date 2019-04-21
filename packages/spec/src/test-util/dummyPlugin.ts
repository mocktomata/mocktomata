import { KomondorPlugin, PluginModule } from '../plugin';

// istanbul ignore next
export const dummyPluginModule: PluginModule = {
  activate(context) {
    context.register(dummyPlugin)
  }
}

// istanbul ignore next
export const dummyPlugin: KomondorPlugin = {
  support() { return true },
  getSpy() { return {} },
  getStub() { return {} },
  serialize() { return '' }
}


// istanbul ignore next
export const pluginModuleA: PluginModule = {
  activate(context) {
    context.register(pluginA)
  }
}

// istanbul ignore next
export const pluginA: KomondorPlugin = {
  name: 'plugin-a',
  support() { return true },
  getSpy() { return {} },
  getStub() { return {} },
  serialize() { return '' }
}

