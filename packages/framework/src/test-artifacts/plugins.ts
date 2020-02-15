import { SpecPlugin } from '../spec-plugin/types';

// istanbul ignore next
export const echoPluginModule: SpecPlugin.Module = {
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
export const pluginModuleA: SpecPlugin.Module = {
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
}

// istanbul ignore next
export const missGetSpyPluginModule = {
  activate(context: any) {
    context.register(missGetSpyPlugin)
  }
}

// istanbul ignore next
export const missGetSpyPlugin = {
  support() { return false },
  createStub() { return {} },
  serialize() { return '' }
}
// istanbul ignore next
export const missGetStubPluginModule = {
  activate(context: any) {
    context.register(missGetStubPlugin)
  }
}

// istanbul ignore next
export const missGetStubPlugin = {
  support() { return false },
  createSpy() { return {} },
  serialize() { return '' }
}
// istanbul ignore next
export const missSupportPluginModule = {
  activate(context: any) {
    context.register(missSupportPlugin)
  }
}

// istanbul ignore next
export const missSupportPlugin = {
  createSpy() { return {} },
  createStub() { return {} },
  serialize() { return '' }
}
// istanbul ignore next
export const noActivatePluginModule = {
}
