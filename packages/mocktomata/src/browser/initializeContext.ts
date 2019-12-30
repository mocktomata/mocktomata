import { addPluginModule, es2015, SpecContext } from '@mocktomata/framework'
import { createIO } from '@mocktomata/io-client'
import { createContext } from 'async-fp'
import { store } from '../browser/store'

// TODO: environment detection and load the right target module.
// handle config
export function initializeContext() {
  if (store.value.context) return store.value.context

  addPluginModule(es2015.name, es2015)
  const context = createContext<SpecContext>(() => createIO().then(io => ({ io })))
  store.value.context = context
  return context
}
