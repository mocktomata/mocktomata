import { KomondorPlugin, PluginModule } from '../interfaces';

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
