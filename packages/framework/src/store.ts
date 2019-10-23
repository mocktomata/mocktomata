import { createStore } from 'global-store';
import { SpecMode } from './spec/types';
import { SpecPluginInstance } from './spec/types-internal';

export type SpecStore = {
  plugins: SpecPluginInstance[],
  overrideMode?: SpecMode,
  filePathFilter?: RegExp,
  specNameFilter?: RegExp
}

export const store = createStore<SpecStore>({
  moduleName: '@mocktomata/framework',
  key: '578b2645-0a5b-4364-89a7-0906d214d769',
  version: '7.0.0',
  initializer: current => {
    return {
      plugins: [],
      ...current
    } as SpecStore
  }
})
