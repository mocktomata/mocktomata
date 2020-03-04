import a from 'assertron'
import { AsyncContext } from 'async-fp'
import { transformConfig } from '../mockto/transformConfig'
import { loadPlugins } from '../spec-plugin'
import { createTestContext, createTestIO } from '../test-utils'
import { ExtraReference, PluginsNotLoaded } from './errors'
import { createSimulator } from './simulator'
import { Spec } from './types'

test('create not expected stub throws', async () => {
  const context = createTestContext().merge(loadPlugins, { lazy: true }).merge(transformConfig, { lazy: true })
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
  const simulator = createSimulator(
    context,
    'no plugin',
    { refs: [{ plugin: 'not-installed', profile: 'target' }], actions: [] },
    { timeout: 10 })
  a.throws(() => simulator.createStub(() => { }), PluginsNotLoaded)
})
