import assertron from 'assertron';
import { dirSync } from 'tmp';
import { readByHash } from './readByHash';
import { writeByHash } from './writeByHash';

test('can read conflicted spec', async () => {
  const tmp = dirSync()
  writeByHash(tmp.name, 'conflict1', '{ "actions":[], "expectation": "a" }', 'conflicted hash')
  writeByHash(tmp.name, 'conflict2', '{ "actions":[], "expectation": "b" }', 'conflicted hash')

  const actual = readByHash(tmp.name, 'conflict2', 'conflicted hash')
  assertron.satisfies(actual, { expectation: 'b' })
})

