import { addPluginModule, es2015, SpecContext } from '@mocktomata/framework'
import { createIO } from '@mocktomata/io-local'
import { createContext } from 'async-fp'
import { Store } from 'global-store'
import { WorkerStore } from '../types'

// TODO: environment detection and load the right target module.
// handle config
export function initializeContext(store: Store<WorkerStore>) {
  if (store.value.context) return store.value.context

  addPluginModule(es2015.name, es2015)
  const io = createIO()
  const context = createContext<SpecContext>()
  context.set({ io })
  store.value.context = context
  return context
}
