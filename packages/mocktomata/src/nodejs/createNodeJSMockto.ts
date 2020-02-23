import { addPluginModule, es2015, loadPlugins, Mocktomata } from '@mocktomata/framework'
import { createIO } from '@mocktomata/io-local'
import { AsyncContext } from 'async-fp'
import { createMockto } from '../utils'
import { store } from './store'

export function createNodeJSMockto() {
  return createMockto(() => {
    if (store.value.context) return store.value.context
    const context = store.value.context = new AsyncContext<Mocktomata.Context>()
    const io = createIO()
    addPluginModule(es2015.name, es2015)
    Promise.all([io.getConfig(), loadPlugins({ io })]).then(([config]) => context.set({ io, config }))
    return context
  })
}
