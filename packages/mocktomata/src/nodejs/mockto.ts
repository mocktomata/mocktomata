import { addPluginModule, es2015, loadPlugins, Spec } from '@mocktomata/framework'
import { createIO } from '@mocktomata/io-local'
import { AsyncContext } from 'async-fp'
import { createMockto } from '../utils'
import { store } from './store'

export const mockto = createMockto(() => {
  if (store.value.context) return store.value.context
  const context = store.value.context = new AsyncContext<Spec.Context>()
  const io = createIO()

  addPluginModule(es2015.name, es2015)
  loadPlugins({ io }).then(() => context.set({ io, config: {} }))
  return context
})
