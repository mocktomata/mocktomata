import { addPluginModule, es2015 } from '@mocktomata/framework'
import { context } from '@mocktomata/framework/lib/context'
import { createIO } from '@mocktomata/io-local'
import { store } from './store'

// TODO: environment detection and load the right target module.
// handle config
export function initializeContext() {
  if (store.value.initialized) return

  addPluginModule(es2015.name, es2015)
  const io = createIO()
  context.set({ io })
  store.value.initialized = true
}
