import { requiredDeep } from 'type-plus'
import type { Config } from '../config/types.js'
import { es2015 } from '../es2015.js'
import type { SpecPlugin } from '../spec-plugin/types.js'
import { SpecNotFound } from '../spec/index.js'
import type { Mocktomata } from '../types.js'

export namespace createTestIO {
  export type Options = {
    modules?: Record<string, SpecPlugin.Module>,
    config?: Config.Input
  }
  export type TestIO = {
    getAllSpecs(): IterableIterator<[string, string]>,
    addPluginModule(moduleName: string, pluginModule: SpecPlugin.Module): void,
  } & Mocktomata.IO
}

export function createTestIO(options?: createTestIO.Options): createTestIO.TestIO {
  const specStore = new Map<string, string>()
  const { config, modules } = requiredDeep({
    config: {},
    modules: { [es2015.name]: es2015 } as Record<string, SpecPlugin.Module>
  }, options)
  return {
    // istanbul ignore next
    getAllSpecs() {
      return specStore.entries()
    },
    async loadConfig() {
      return config
    },
    readSpec(specName, specRelativePath) {
      const record = specStore.get(specName)
      if (!record) return Promise.reject(new SpecNotFound(specName, specRelativePath))
      return Promise.resolve(JSON.parse(record))
    },
    async writeSpec(title, _specRelativePath, record) {
      specStore.set(title, JSON.stringify(record))
    },
    addPluginModule(moduleName: string, pluginModule: SpecPlugin.Module) {
      modules[moduleName] = pluginModule
    },
    loadPlugin(name) {
      const m = modules[name]
      if (m) return Promise.resolve(m)
      throw new Error(`module ${name} not found`)
    }
  }
}
