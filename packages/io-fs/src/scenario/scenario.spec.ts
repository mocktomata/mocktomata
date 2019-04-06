import t from 'assert';
import a from 'assertron';
import fs from 'fs';
import { dirSync } from 'tmp';
import { createFileIO } from '..';

describe('readScenario()', () => {
  test('not exist Scenario throws ScenarioNotFound', async () => {
    const tmp = dirSync()
    const io = createFileIO(tmp.name)
    a.throws(() => io.readScenario('not existing scenario'))
  })
  test('retrieve record for saved Scenario', async () => {
    const tmp = dirSync()
    const io = createFileIO(tmp.name)

    const expected = JSON.stringify({ actions: [], expectation: 'some expectation' })
    io.writeScenario('retrieve', expected)
    const actual = io.readScenario('retrieve')
    t.deepStrictEqual(actual, expected)
  })
})

describe('writeScenario()', () => {
  test('write scenario to the scenario folder', async () => {
    const tmp = dirSync()
    const io = createFileIO(tmp.name)
    io.writeScenario('some Scenario', JSON.stringify({ actions: [], expectation: 'some expectation' }))

    const folderContent = fs.readdirSync(tmp.name)
    t.strictEqual(folderContent.length, 1)
  })
})
