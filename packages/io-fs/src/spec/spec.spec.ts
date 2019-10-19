import t from 'assert';
import a from 'assertron';
import { dirSync } from 'tmp';
import { createFileRepository } from '..';

describe('readSpec()', () => {
  test('not exist spec throws SpecNotFound', async () => {
    const tmp = dirSync()
    const io = createFileRepository(tmp.name)

    await a.throws(() => io.readSpec('not existing spec', ''))
  })
  test('retrieve record for saved spec', async () => {
    const tmp = dirSync()
    const io = createFileRepository(tmp.name)
    const expected = JSON.stringify({ actions: [], expectation: 'some expectation' })
    await io.writeSpec('retrieve', '', expected)

    const actual = await io.readSpec('retrieve', '')
    t.deepStrictEqual(actual, expected)
  })
})
