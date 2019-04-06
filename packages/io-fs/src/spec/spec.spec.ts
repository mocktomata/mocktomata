import t from 'assert';
import a from 'assertron';
import { dirSync } from 'tmp';
import { createFileIO } from '..';

describe('readSpec()', () => {
  test('not exist spec throws SpecNotFound', async () => {
    const tmp = dirSync()
    const io = createFileIO(tmp.name)

    a.throws(() => io.readSpec('not existing spec'))
  })
  test('retrieve record for saved spec', async () => {
    const tmp = dirSync()
    const io = createFileIO(tmp.name)
    const expected = JSON.stringify({ actions: [], expectation: 'some expectation' })
    io.writeSpec('retrieve', expected)

    const actual = io.readSpec('retrieve')
    t.deepStrictEqual(actual, expected)
  })
})
