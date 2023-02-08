import { NotSpecable, SpecIDCannotBeEmpty, SpecNotFound } from '@mocktomata/framework'
import a from 'assertron'
import { mockto } from '../index.js'

function noop() {}

mockto('', (_, spec) => {
	it('throws when specName is empty (auto)', async () => {
		await a.throws(() => spec(noop), SpecIDCannotBeEmpty)
	})
})

mockto.save('', (_, spec) => {
	it('throws when specName is empty (save)', async () => {
		await a.throws(spec(noop), SpecIDCannotBeEmpty)
	})
})

mockto.simulate('', (_, spec) => {
	it('throws when specName is empty (simulate)', async () => {
		await a.throws(spec(noop), SpecIDCannotBeEmpty)
	})
})

mockto.save(`type %s is not specable`, (specName, spec) => {
	test.each<[any, any]>([
		['undefined', undefined],
		['null', null],
		['number', 1],
		['boolean', true],
		['symbol', Symbol()],
		['string', 'string'],
		['array', []]
	])(specName, async ([, value]) => {
		await a.throws(() => spec(value), NotSpecable)
	})
})

mockto.simulate('not exist', (_, spec) => {
	it('throws during simulate if spec record does not exist', async () => {
		await a.throws(
			spec((x: any) => x),
			SpecNotFound
		)
	})
})

test.todo('plugin with passive spy (same as subject spy)')

mockto('calling handler without options', (specName, spec) => {
	test(specName, async () => {
		expect(specName).toEqual('calling handler without options')
		const subject = await spec((x: number) => x)
		expect(subject(3)).toBe(3)

		await spec.done()
	})
})

mockto('calling handler with options', { timeout: 100 }, (specName, spec) => {
	test(specName, async () => {
		expect(specName).toEqual('calling handler with options')
		const subject = await spec((x: number) => x)
		expect(subject(3)).toBe(3)

		await spec.done()
	})
})
