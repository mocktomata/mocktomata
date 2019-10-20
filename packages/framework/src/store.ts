import { createStore } from 'global-store';
import { SpecMode } from './mockto/types';
import { SpecPluginInstance } from './mockto/types-internal';

export type SpecStore = {
  specTypeIds: Record<string, number>,
  plugins: SpecPluginInstance[],
  specOverrides: any[],
  specDefaultMode: SpecMode
}

export const store = createStore<SpecStore>({
  moduleName: '@mocktomata/framework',
  key: '578b2645-0a5b-4364-89a7-0906d214d769',
  version: '7.0.0',
  initializer: current => {
    return {
      specTypeIds: {},
      plugins: [],
      specOverrides: [],
      ...current
    } as SpecStore
  }
})
