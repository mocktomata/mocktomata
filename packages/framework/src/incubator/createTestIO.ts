import { SpecNotFound, SpecPlugin, SpecPluginModule } from '../mockto';
import { TestIO } from './types';


export function createTestIO(): TestIO {
  const specStore = new Map<string, string>()
  const plugins: Record<string, SpecPluginModule> = {}
  return {
    getAllSpecs() {
      return specStore.entries()
    },
    readSpec(id) {
      const record = specStore.get(id)
      if (!record) return Promise.reject(new SpecNotFound(id))
      return Promise.resolve(JSON.parse(record))
    },
    async writeSpec(id, record) {
      specStore.set(id, `{
  "refs": [
    ${record.refs.map(r => JSON.stringify(r)).join(',\n    ')}
  ],
  "actions": [
    ${record.actions.map(a => JSON.stringify(a)).join(',\n    ')}
  ]
}`)
    },
    addPluginModule(moduleName: string, pluginModule: SpecPluginModule) {
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
