import t from 'assert';
import { createLocalIO } from './createLocalIO';

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
