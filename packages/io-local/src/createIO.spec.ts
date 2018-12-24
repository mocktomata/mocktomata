import t from 'assert';
import { createIO } from './createIO';

describe('readSpec()', () => {
  test('returns an object', async () => {
    const io = createIO()
    const expected = { actions: [], expectation: 'abc' };
    io.io.readSpec = (() => Promise.resolve(JSON.stringify(expected))) as any

    const actual = await io.readSpec('abc')
    t.deepStrictEqual(actual, expected)
  })
})
