import a from 'assertron'
import { AsyncContext } from 'async-fp'
import { es2015 } from '../es2015'
import { addPluginModule } from '../spec-plugin'
import { createTestIO } from '../test-utils'
import { ExtraReference, PluginsNotLoaded } from './errors'
import { createSimulator } from './simulator'
import { Spec } from './types'

test('create not expected stub throws', async () => {
  const io = createTestIO()
  const plugins = addPluginModule(es2015.name, es2015)
  const context = new AsyncContext<Spec.Context>()
  context.set({ io, config: {}, plugins })
  const sim = createSimulator(
    context,
    'extra ref',
    { refs: [], actions: [] },
    { timeout: 10 })

  a.throws(() => sim.createStub({}), ExtraReference)
})

test('simulate without plugin install throws', () => {
  const io = createTestIO()
  const context = new AsyncContext<Spec.Context>()
  context.set({ io, config: {}, plugins: [] })
  a.throws(() => createSimulator(
    context,
    'no plugin',
    { refs: [{ plugin: 'not-installed', profile: 'target' }], actions: [] },
    { timeout: 10 }), PluginsNotLoaded)
})
