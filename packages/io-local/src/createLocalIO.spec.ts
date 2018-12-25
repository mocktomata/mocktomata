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
