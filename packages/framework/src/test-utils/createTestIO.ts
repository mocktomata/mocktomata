import { es2015 } from '../es2015'
import { Spec, SpecNotFound } from '../spec'
import { SpecPlugin } from '../spec-plugin'
import { prettyPrintSpecRecord } from '../utils'

export namespace createTestIO {
  export type TestIO = {
    getAllSpecs(): IterableIterator<[string, string]>,
    addPluginModule(moduleName: string, pluginModule: SpecPlugin.Module): void,
  } & Spec.IO & SpecPlugin.IO
}

export function createTestIO(): createTestIO.TestIO {
  const specStore = new Map<string, string>()
  const plugins: Record<string, SpecPlugin.Module> = { [es2015.name]: es2015 }
  return {
    // istanbul ignore next
    getAllSpecs() {
      return specStore.entries()
    },
    async getConfig() {
      return { plugins: Object.keys(plugins) } as any
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
      plugins[moduleName] = pluginModule
    },
    loadPlugin(name) {
      const m = plugins[name]
      if (m) return Promise.resolve(m)
      throw new Error(`module ${name} not found`)
    }
  }
}
