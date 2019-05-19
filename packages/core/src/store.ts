import { createStore } from 'global-store';
import { PluginInstance } from './plugin/typesInternal';

export type SpecStore = {
  specTypeIds: Record<string, number>,
  plugins: PluginInstance[]
}

export const store = createStore<SpecStore>(
  '@komondor-lab/core',
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
