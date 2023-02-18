import t from 'assert'
import { dirSync } from 'tmp'
import { readFrom, writeTo } from './index.js'

test('can read conflicted spec', async () => {
	const tmp = dirSync()
	writeTo(tmp.name, 'conflict-1', '{ "actions":[], "expectation": "a" }')
	writeTo(tmp.name, 'conflict 1', '{ "actions":[], "expectation": "b" }')

	const actual = readFrom(tmp.name, 'conflict 1')
	t.strictEqual(actual, '{ "actions":[], "expectation": "b" }')
})
