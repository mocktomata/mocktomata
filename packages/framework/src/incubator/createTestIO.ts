import { Spec, SpecNotFound } from '../spec'
import { SpecPlugin } from '../spec-plugin'
import { prettyPrintSpecRecord } from '../utils'

export namespace createTestIO {
  export type TestIO = {
    getAllSpecs(): IterableIterator<[string, string]>,
    addPluginModule(moduleName: string, pluginModule: SpecPlugin.Module): void,
    addPlugin(moduleName: string, ...plugins: SpecPlugin[]): void
  } & Spec.IO & SpecPlugin.IO
}

export function createTestIO(): createTestIO.TestIO {
  const specStore = new Map<string, string>()
  const plugins: Record<string, SpecPlugin.Module> = {}
  return {
    // istanbul ignore next
    getAllSpecs() {
      return specStore.entries()
    },
    async getConfig() {
      return { plugins: Object.keys(plugins) } as any
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
    // istanbul ignore next
    addPlugin(moduleName: string, ...plugins: SpecPlugin[]) {
      this.addPluginModule(moduleName, {
        activate(c) {
          plugins.forEach(p => c.register(p))
        }
      })
    },
    loadPlugin(name) {
      const m = plugins[name]
      if (m) return Promise.resolve(m)
      throw new Error('module not found')
    }
  }
}
