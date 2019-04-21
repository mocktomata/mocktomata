import { createStore } from 'global-store';
import { PluginInstance } from './plugin';

export type SpecStore = {
  specTypeIds: Record<string, number>,
  plugins: PluginInstance[]
}

export const store = createStore<SpecStore>(
  '@komondor-lab/plugin',
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
