import t from 'assert'
import { dirSync } from 'tmp'
import { readByHash } from './readByHash.js'
import { writeByHash } from './writeByHash.js'

test('can read conflicted spec', async () => {
  const tmp = dirSync()
  writeByHash(tmp.name, 'conflict1', '{ "actions":[], "expectation": "a" }', 'conflicted hash')
  writeByHash(tmp.name, 'conflict2', '{ "actions":[], "expectation": "b" }', 'conflicted hash')

  const actual = readByHash(tmp.name, 'conflict2', 'conflicted hash')
  t.strictEqual(actual, '{ "actions":[], "expectation": "b" }')
})

