import { addPluginModule, es2015, Spec } from '@mocktomata/framework'
import { createIO } from '@mocktomata/io-client'
import { AsyncContext } from 'async-fp'
import { createMockto } from '../utils'
import { store } from './store'

export const mockto = createMockto(() => {
  addPluginModule(es2015.name, es2015)
  if (store.value.context) return store.value.context
  const context = store.value.context = new AsyncContext<Spec.Context>(
    () => createIO().then(io => ({ io, config: {} }))
  )
  return context
})
