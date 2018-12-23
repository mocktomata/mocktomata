import t from 'assert';
import { createIO } from './createIO';

describe('readSpec()', () => {
  test('read existing spec', async () => {
    const io = createIO({ url: 'http://localhost' })
    const expected = { actions: [], expectation: 'abc' };
    io.fetch = () => Promise.resolve({ json: () => expected })

    const actual = await io.readSpec('abc')
    t.deepStrictEqual(actual, expected)
  })
})

