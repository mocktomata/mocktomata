import { KomondorPlugin, PluginModule } from '../types';

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
