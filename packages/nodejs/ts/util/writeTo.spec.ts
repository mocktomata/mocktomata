import t from 'assert'
import fs from 'fs'
import { dirSync } from 'tmp'
import { writeTo } from './writeTo.js'

test('conflict id will save in different file', async () => {
  const tmp = dirSync()
  writeTo(tmp.name, 'conflict-1', '{ "actions":[], "expectation": "a" }')
  writeTo(tmp.name, 'conflict 1', '{ "actions":[], "expectation": "b" }')

  const dirs = fs.readdirSync(tmp.name)
  t.strictEqual(dirs.length, 2)
})

