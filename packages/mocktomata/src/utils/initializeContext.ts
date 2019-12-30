import { addPluginModule, es2015, SpecContext } from '@mocktomata/framework'
import { createIO } from '@mocktomata/io-local'
import { store } from '../store'
import { createContext } from 'async-fp'

// TODO: environment detection and load the right target module.
// handle config
export function initializeContext() {
  if (store.value.context) return store.value.context

  addPluginModule(es2015.name, es2015)
  const io = createIO()
  const context = createContext<SpecContext>()
  context.set({ io })
  store.value.context = context
  return context
}
