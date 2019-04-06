import t from 'assert';
import a from 'assertron';
import { dirSync } from 'tmp';
import { createSpecIO } from '.';

describe('readSpec()', () => {
  test('not exist spec throws SpecNotFound', async () => {
    const tmp = dirSync()
    const specIO = createSpecIO(tmp.name)
    a.throws(() => specIO.read('not existing spec'))
  })
  test('retrieve record for saved spec', async () => {
    const tmp = dirSync()
    const specIO = createSpecIO(tmp.name)
    const expected = JSON.stringify({ actions: [], expectation: 'some expectation' })
    specIO.write('retrieve', expected)
    const actual = specIO.read('retrieve')
    t.deepStrictEqual(actual, expected)
  })
})
