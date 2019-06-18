import { KomondorPlugin, PluginModule } from '../plugin';

// istanbul ignore next
export const echoPluginModule: PluginModule = {
  activate(context) {
    context.register(echoPlugin)
  }
}

// istanbul ignore next
export const echoPlugin: KomondorPlugin = {
  support() { return true },
  createSpy(_, s) { return s },
  createStub(_, s) { return s },
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
  createSpy() { return {} },
  createStub() { return {} },
  serialize() { return '' }
}

