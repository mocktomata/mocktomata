import { createStore } from 'global-store';
import { PluginInstance } from './types';

export type SpecStore = {
  specTypeIds: Record<string, number>,
  plugins: PluginInstance[]
}

export const store = createStore<SpecStore>(
  '@mocktomata/plugin',
  {
    specTypeIds: {},
    plugins: []
  }
)

export function resetStore() {
  store.set({
    specTypeIds: {},
    plugins: []
  })
}
