import t from 'assert';
import a from 'assertron';
import fs from 'fs';
import { dirSync } from 'tmp';
import { createSpecIO } from '..';
import { SpecNotFound } from '../errors';

describe('readSpec()', () => {
  test('not exist spec throws SpecNotFound', async () => {
    const tmp = dirSync()
    const specIO = createSpecIO({ cwd: tmp.name })
    await a.throws(() => specIO.read('not existing spec'), SpecNotFound)
  })
  test('retrieve record for saved spec', async () => {
    const tmp = dirSync()
    const specIO = createSpecIO({ cwd: tmp.name })

    const expected = JSON.stringify({ actions: [], expectation: 'some expectation' })
    await specIO.write('retrieve', expected)
    const actual = await specIO.read('retrieve')
    t.deepStrictEqual(actual, expected)
  })
})

describe('writeSpec()', () => {
  test('write spec to the spec folder', async () => {
    const tmp = dirSync()
    const specIO = createSpecIO({ cwd: tmp.name })

    await specIO.write('some spec', JSON.stringify({ actions: [], expectation: 'some expectation' }))
    const folderContent = fs.readdirSync(tmp.name)
    t.strictEqual(folderContent.length, 1)
  })
})
