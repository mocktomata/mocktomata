import { json } from '@mocktomata/framework'
import t from 'assert'
import a from 'assertron'
import { dirSync } from 'tmp'
import { readSpec, writeSpec } from './index.js'

test('not exist spec throws SpecNotFound', async () => {
	const tmp = dirSync()

	await a.throws(() => readSpec(tmp.name, 'not existing spec', ''))
})
test('retrieve record for saved spec', async () => {
	const tmp = dirSync()
	const expected = json.stringify({ actions: [], expectation: 'some expectation' })
	await writeSpec(tmp.name, 'retrieve', '', expected)

	const actual = await readSpec(tmp.name, 'retrieve', '')
	t.deepStrictEqual(actual, expected)
})
