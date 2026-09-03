import t from 'node:assert'
import fs from 'node:fs'
import { dirSync } from 'tmp'
import { writeTo } from './file.js'

test('conflict id will save in different file', async () => {
	const tmp = dirSync()
	writeTo(tmp.name, 'conflict-1', '{ "actions":[], "expectation": "a" }')
	writeTo(tmp.name, 'conflict 1', '{ "actions":[], "expectation": "b" }')

	const dirs = fs.readdirSync(tmp.name)
	t.strictEqual(dirs.length, 2)
})
