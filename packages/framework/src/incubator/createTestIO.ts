import { Spec, SpecNotFound } from '../spec'
import { SpecPlugin } from '../spec-plugin'
import { prettyPrintSpecRecord } from '../utils'

export type TestIO = {
  getAllSpecs(): IterableIterator<[string, string]>,
  addPluginModule(moduleName: string, pluginModule: SpecPlugin.Module): void,
  addPlugin(moduleName: string, ...plugins: SpecPlugin[]): void
} & Spec.IO & SpecPlugin.IO

export function createTestIO(): TestIO {
  const specStore = new Map<string, string>()
  const plugins: Record<string, SpecPlugin.Module> = {}
  return {
    getAllSpecs() {
      return specStore.entries()
    },
    async getSpecConfig() {
      return {}
    },
    readSpec(title) {
      const record = specStore.get(title)
      if (!record) return Promise.reject(new SpecNotFound(title))
      return Promise.resolve(JSON.parse(record))
    },
    async writeSpec(title, _specPath, record) {
      specStore.set(title, prettyPrintSpecRecord(record))
    },
    addPluginModule(moduleName: string, pluginModule: SpecPlugin.Module) {
      plugins[moduleName] = pluginModule
    },
    addPlugin(moduleName: string, ...plugins: SpecPlugin[]) {
      this.addPluginModule(moduleName, {
        activate(c) {
          plugins.forEach(p => c.register(p))
        }
      })
    },
    getPluginList() {
      return Promise.resolve(Object.keys(plugins))
    },
    loadPlugin(name) {
      const m = plugins[name]
      if (m) return Promise.resolve(m)
      throw new Error('module not found')
    }
  }
}
