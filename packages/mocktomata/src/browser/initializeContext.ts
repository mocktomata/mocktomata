import { addPluginModule, es2015, Spec } from '@mocktomata/framework'
import { createIO } from '@mocktomata/io-client'
import { AsyncContext } from 'async-fp'
import { Store } from 'global-store'
import { WorkerStore } from '../types'

// TODO: environment detection and load the right target module.
// handle config
export function initializeContext(store: Store<WorkerStore>) {
  if (store.value.context) return store.value.context

  addPluginModule(es2015.name, es2015)
  const context = new AsyncContext<Spec.Context>(() => createIO().then(io => ({ io })))
  store.value.context = context
  return context
}
