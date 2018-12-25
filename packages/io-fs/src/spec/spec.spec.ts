import t from 'assert';
import a from 'assertron';
import fs from 'fs';
import { dirSync } from 'tmp';
import { readSpec, writeSpec } from '..';
import { SpecNotFound } from '../errors';

describe('readSpec()', () => {
  test('not exist spec throws SpecNotFound', async () => {
    const tmp = dirSync()
    readSpec.dir = tmp.name
    await a.throws(() => readSpec('not existing spec'), SpecNotFound)
  })
  test('retrieve record for saved spec', async () => {
    const tmp = dirSync()
    readSpec.dir = tmp.name
    writeSpec.dir = tmp.name

    const expected = JSON.stringify({ actions: [], expectation: 'some expectation' })
    await writeSpec('retrieve', expected)
    const actual = await readSpec('retrieve')
    t.deepStrictEqual(actual, expected)
  })
})

describe('writeSpec()', () => {
  test('write spec to the spec folder', async () => {
    const tmp = dirSync()
    writeSpec.dir = tmp.name
    await writeSpec('some spec', JSON.stringify({ actions: [], expectation: 'some expectation' }))
    const folderContent = fs.readdirSync(tmp.name)
    t.strictEqual(folderContent.length, 1)
  })
})
