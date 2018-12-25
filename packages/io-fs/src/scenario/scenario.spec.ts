import t from 'assert';
import a from 'assertron';
import fs from 'fs';
import { dirSync } from 'tmp';
import { readScenario, writeScenario } from '..';
import { ScenarioNotFound } from '../errors';

describe('readScenario()', () => {
  test('not exist Scenario throws ScenarioNotFound', async () => {
    const tmp = dirSync()
    readScenario.dir = tmp.name
    await a.throws(() => readScenario('not existing scenario'), ScenarioNotFound)
  })
  test('retrieve record for saved Scenario', async () => {
    const tmp = dirSync()
    readScenario.dir = tmp.name
    writeScenario.dir = tmp.name

    const expected = JSON.stringify({ actions: [], expectation: 'some expectation' })
    await writeScenario('retrieve', expected)
    const actual = await readScenario('retrieve')
    t.deepStrictEqual(actual, expected)
  })
})

describe('writeScenario()', () => {
  test('write scenario to the scenario folder', async () => {
    const tmp = dirSync()
    writeScenario.dir = tmp.name
    await writeScenario('some Scenario', JSON.stringify({ actions: [], expectation: 'some expectation' }))
    const folderContent = fs.readdirSync(tmp.name)
    t.strictEqual(folderContent.length, 1)
  })
})
