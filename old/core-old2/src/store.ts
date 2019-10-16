import { createStore } from 'global-store';
import { PluginInstance } from './plugin/typesInternal';

export type SpecStore = {
  specTypeIds: Record<string, number>,
  plugins: PluginInstance[]
}

export const store = createStore<SpecStore>({
  moduleName: '@mocktomata/framework',
  key: '578b2645-0a5b-4364-89a7-0906d214d769',
  version: '7.0.0',
  initializer: (current) => {
    return {
      specTypeIds: {},
      plugins: [],
      ...current
    } as SpecStore
  }
})

export function resetStore() {
  store.reset()
}
