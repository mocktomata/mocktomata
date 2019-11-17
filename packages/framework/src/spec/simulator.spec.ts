import a from 'assertron'
import { ExtraReference, PluginNotFound } from './errors'
import { createSimulator } from './simulator'

test('create not expected stub throws', () => {
  const sim = createSimulator(
    'extra ref',
    { refs: [], actions: [] },
    { timeout: 10 })

  a.throws(() => sim.createStub({}, {}), ExtraReference)
})

test('simulate without plugin install throws', () => {
  const sim = createSimulator(
    'no plugin',
    { refs: [{ plugin: 'not-installed', mode: 'passive' }], actions: [] },
    { timeout: 10 })

  a.throws(() => sim.createStub({}, {}), PluginNotFound)
})
