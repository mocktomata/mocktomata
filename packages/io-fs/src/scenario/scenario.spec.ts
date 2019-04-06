import t from 'assert';
import a from 'assertron';
import fs from 'fs';
import { dirSync } from 'tmp';
import { createScenarioIO } from '.';

describe('readScenario()', () => {
  test('not exist Scenario throws ScenarioNotFound', async () => {
    const tmp = dirSync()
    const io = createScenarioIO(tmp.name)
    a.throws(() => io.read('not existing scenario'))
  })
  test('retrieve record for saved Scenario', async () => {
    const tmp = dirSync()
    const io = createScenarioIO(tmp.name)

    const expected = JSON.stringify({ actions: [], expectation: 'some expectation' })
    io.write('retrieve', expected)
    const actual = io.read('retrieve')
    t.deepStrictEqual(actual, expected)
  })
})

describe('writeScenario()', () => {
  test('write scenario to the scenario folder', async () => {
    const tmp = dirSync()
    const io = createScenarioIO(tmp.name)
    io.write('some Scenario', JSON.stringify({ actions: [], expectation: 'some expectation' }))

    const folderContent = fs.readdirSync(tmp.name)
    t.strictEqual(folderContent.length, 1)
  })
})
