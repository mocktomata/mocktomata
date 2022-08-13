// istanbul ignore file

import { SpecPlugin } from '../spec-plugin/types.js'

export const echoPluginModule: SpecPlugin.Module = {
  activate(context) {
    context.register(echoPlugin)
  }
}

export const echoPlugin: SpecPlugin = {
  support() { return true },
  createSpy(_, s) { return s },
  createStub(_, s) { return s },
}

export const pluginModuleA: SpecPlugin.Module = {
  activate(context) {
    context.register(pluginA)
  }
}

export const pluginA: SpecPlugin = {
  name: 'plugin-a',
  support() { return true },
  createSpy() { return {} },
  createStub() { return {} },
}

export const missGetSpyPluginModule = {
  activate(context: any) {
    context.register(missGetSpyPlugin)
  }
}

export const missGetSpyPlugin = {
  support() { return false },
  createStub() { return {} },
  serialize() { return '' }
}
export const missGetStubPluginModule = {
  activate(context: any) {
    context.register(missGetStubPlugin)
  }
}

export const missGetStubPlugin = {
  support() { return false },
  createSpy() { return {} },
  serialize() { return '' }
}
export const missSupportPluginModule = {
  activate(context: any) {
    context.register(missSupportPlugin)
  }
}

export const missSupportPlugin = {
  createSpy() { return {} },
  createStub() { return {} },
  serialize() { return '' }
}
export const noActivatePluginModule = {
}
