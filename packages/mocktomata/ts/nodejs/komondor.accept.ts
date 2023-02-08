import { SpecIDCannotBeEmpty } from '@mocktomata/framework'
import a from 'assertron'
import { kd } from '../index.js'

function noop() {}

it('throws when specName is empty (auto)', async () => {
	const spec = kd('')
	await a.throws(() => spec(noop), SpecIDCannotBeEmpty)
})

it('throws when specName is empty (save)', async () => {
	const spec = kd.save('')
	await a.throws(() => spec(noop), SpecIDCannotBeEmpty)
})

it('throws when specName is empty (simulate)', async () => {
	const spec = kd.simulate('')
	await a.throws(() => spec(noop), SpecIDCannotBeEmpty)
})
