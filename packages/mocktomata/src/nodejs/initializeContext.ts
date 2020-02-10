import { addPluginModule, es2015, loadPlugins, SpecContext } from '@mocktomata/framework'
import { createIO } from '@mocktomata/io-local'
import { createContext } from 'async-fp'
import { Store } from 'global-store'
import { NodeJSStore } from './store'

// handle config
export function initializeContext(store: Store<NodeJSStore>) {
  if (store.value.context) return store.value.context

  // TODO: environment detection and load the right target module.
  addPluginModule(es2015.name, es2015)

  const context = createContext<SpecContext>()
  store.value.context = context

  const io = createIO()
  loadPlugins({ io }).then(() => context.set({ io }))
  return context
}
