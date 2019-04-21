import { PluginIO, PluginModule } from '../plugin';
import { SpecIO, SpecRecord } from '../spec/types';

export type MemoryIO = {
  addPlugin(name: string, plugin: PluginModule): void
} & SpecIO & PluginIO

export function createMemoryIO(): MemoryIO {
  const specs: Record<string, SpecRecord> = {}
  const plugins: Record<string, PluginModule> = {}
  return {
    readSpec(id) {
      return Promise.resolve(specs[id])
    },
    async writeSpec(id, record) {
      specs[id] = record
    },
    addPlugin(name: string, plugin: PluginModule) {
      plugins[name] = plugin
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
