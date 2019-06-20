import { PluginIO, PluginModule } from '../plugin/types';
import { SpecIO, SpecNotFound, SpecPlugin } from '../spec';

export type TestIO = {
  specs: Record<string, string>
  addPluginModule(moduleName: string, pluginModule: PluginModule): void
  addPlugin(moduleName: string, ...plugins: SpecPlugin[]): void
} & SpecIO & PluginIO

export function createTestIO(): TestIO {
  const specs: Record<string, string> = {}
  const plugins: Record<string, PluginModule> = {}
  return {
    specs,
    readSpec(id) {
      const record = specs[id]
      if (!record) return Promise.reject(new SpecNotFound(id))
      return Promise.resolve(JSON.parse(record))
    },
    async writeSpec(id, record) {
      specs[id] = `{
  "refs": [
    ${record.refs.map(r => JSON.stringify(r)).join(',\n    ')}
  ],
  "actions": [
    ${record.actions.map(a => JSON.stringify(a)).join(',\n    ')}
  ]
}`
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
