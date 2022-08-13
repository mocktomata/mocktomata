import { requiredDeep } from 'type-plus'
import { es2015 } from '../es2015.js'
import { Spec, SpecNotFound } from '../spec/index.js'
import { SpecPlugin } from '../spec-plugin/index.js'
import { Mocktomata } from '../types.js'
import { prettyPrintSpecRecord } from '../utils/index.js'

export namespace createTestIO {
  export type Options = {
    config?: Partial<Mocktomata.Config>,
    modules?: Record<string, SpecPlugin.Module>
  }
  export type TestIO = {
    getAllSpecs(): IterableIterator<[string, string]>,
    addPluginModule(moduleName: string, pluginModule: SpecPlugin.Module): void,
  } & Spec.IO & SpecPlugin.IO
}

export function createTestIO(options?: createTestIO.Options): createTestIO.TestIO {
  const specStore = new Map<string, string>()
  const { config, modules } = requiredDeep({
    config: { ecmaVersion: 'es2015', plugins: [] },
    modules: { [es2015.name]: es2015 } as Record<string, SpecPlugin.Module>
  }, options)
  return {
    // istanbul ignore next
    getAllSpecs() {
      return specStore.entries()
    },
    async getConfig() {
      return config
    },
    readSpec(specName, specRelativePath) {
      const record = specStore.get(specName)
      if (!record) return Promise.reject(new SpecNotFound(specName, specRelativePath))
      return Promise.resolve(JSON.parse(record))
    },
    async writeSpec(title, _specRelativePath, record) {
      specStore.set(title, prettyPrintSpecRecord(record))
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
