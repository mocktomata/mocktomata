import { PluginModule } from '../plugin';
import { SpecPlugin } from '../spec';

// istanbul ignore next
export const echoPluginModule: PluginModule = {
  activate(context) {
    context.register(echoPlugin)
  }
}

// istanbul ignore next
export const echoPlugin: SpecPlugin = {
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
export const pluginA: SpecPlugin = {
  name: 'plugin-a',
  support() { return true },
  createSpy() { return {} },
  createStub() { return {} },
  serialize() { return '' }
}

