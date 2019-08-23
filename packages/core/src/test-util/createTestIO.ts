import { PluginIO, PluginModule } from '../plugin/types';
import { SpecIO, SpecNotFound, SpecPlugin } from '../spec';

export type TestIO = {
  getAllSpecs(): IterableIterator<[string, string]>,
  addPluginModule(moduleName: string, pluginModule: PluginModule): void,
  addPlugin(moduleName: string, ...plugins: SpecPlugin[]): void
} & SpecIO & PluginIO

export function createTestIO(): TestIO {
  const specs = new Map<string, string>()
  const plugins: Record<string, PluginModule> = {}
  return {
    getAllSpecs() {
      return specs.entries()
    },
    readSpec(id) {
      const record = specs.get(id)
      if (!record) return Promise.reject(new SpecNotFound(id))
      return Promise.resolve(JSON.parse(record))
    },
    async writeSpec(id, record) {
      specs.set(id, `{
  "refs": [
    ${record.refs.map(r => JSON.stringify(r)).join(',\n    ')}
  ],
  "actions": [
    ${record.actions.map(a => JSON.stringify(a)).join(',\n    ')}
  ]
}`)
    },
    addPluginModule(moduleName: string, pluginModule: PluginModule) {
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
