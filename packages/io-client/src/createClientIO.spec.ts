import t from 'assert';
import { createClientIO } from '.';

describe('readSpec()', () => {
  test('read existing spec', async () => {
    const io = await createClientIO()
    const expected = { actions: [], expectation: 'abc' };
    io._deps.fetch = () => Promise.resolve({ json: () => expected } as any)

    const actual = await io.readSpec('abc')
    t.deepStrictEqual(actual, expected)
  })
})

describe('loadConfig()', () => {
  test('load...', async () => {
    const io = await createClientIO()
    await io.loadConfig()
  })
})

describe('loadPlugin()', () => {
  test('Load existing plugin', async () => {
    const io = await createClientIO()
    // TODO: Use fs to add @komondor-lab/plugin-fixture-dummy to the tmp folder
    await io.loadPlugin(`@komondor-lab/plugin-fixture-dummy`)
    // t(typeof m.activate === 'function')
  })
})
