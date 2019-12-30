import { SpecContext, Spec } from '@mocktomata/framework'
import { Context } from 'async-fp'
import { createStore } from 'global-store'

export type MocktomataStore = {
  context: Context<SpecContext> | undefined,
  overrideMode?: Spec.Mode,
  filePathFilter?: RegExp,
  specNameFilter?: RegExp
}

export const store = createStore<MocktomataStore>({
  moduleName: 'mocktomata',
  key: 'f6d1823b-b529-473e-ab84-17cada707ef9',
  version: '7.0.0',
  initializer: current => current
})
