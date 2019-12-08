import a from 'assertron'
import { incubator } from '../incubator'
import { ExtraReference, PluginsNotLoaded } from './errors'
import { createSimulator } from './simulator'

beforeAll(() => incubator.start({ target: 'es2015' }))

test('create not expected stub throws', () => {
  const sim = createSimulator(
    'extra ref',
    { refs: [], actions: [] },
    { timeout: 10 })

  a.throws(() => sim.createStub({}), ExtraReference)
})

test('simulate without plugin install throws', () => {
  a.throws(() => createSimulator(
    'no plugin',
    { refs: [{ plugin: 'not-installed', profile: 'target' }], actions: [] },
    { timeout: 10 }), PluginsNotLoaded)
})
