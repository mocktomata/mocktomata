import t from 'assert';
import a from 'assertron';
import { createLocalIO } from './createLocalIO';
import { PluginNotConforming, PluginNotFound } from './errors';

describe('readSpec()', () => {
  test('returns an object', async () => {
    const io = createLocalIO()
    const expected = { actions: [], expectation: 'abc' };
    io._deps.spec.read = (() => Promise.resolve(JSON.stringify(expected))) as any

    const actual = await io.readSpec('abc')
    t.deepStrictEqual(actual, expected)
  })
})

describe('loadPlugin()', () => {
  test('Not existing plugin throws PluginNotFound', async () => {
    const io = createLocalIO()
    await a.throws(() => io.loadPlugin('not-exist'), PluginNotFound)
  })

  test('package without activate function throws PluginNotConforming', async () => {
    const io = createLocalIO()
    await a.throws(() => io.loadPlugin('@komondor-lab/plugin-fixture-no-activate'), PluginNotConforming)
  })

  test('load npm plugin package', async () => {
    const io = createLocalIO()
    const actual = await io.loadPlugin('@komondor-lab/plugin-fixture-dummy')

    t.strictEqual(typeof actual.activate, 'function')
  })

  test('can load plugin using deep link', async () => {
    const io = createLocalIO()
    const actual = await io.loadPlugin('@komondor-lab/plugin-fixture-deep-link/pluginA')

    t.strictEqual(typeof actual.activate, 'function')
  })
})
