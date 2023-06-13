import { a } from 'assertron'
import { incubator } from './incubator/index.js'
import { InvokeMetaMethodAfterSpec } from './spec/index.js'

incubator.save('call after spec throws', (specName, spec) => {
	test(specName, async () => {
		await spec({})
		a.throws(() => spec.ignoreMismatch(1), InvokeMetaMethodAfterSpec)
	})
})
incubator.sequence(
	'reference object changes are ignored by default. Garbage-in garbage-out issues are handled by tests, not by the system',
	(specName, { save, simulate }) => {
		test(specName, async () => {
			const subject = (x: string) => x
			const s = await save(subject)
			expect(s('192.168.0.123')).toBe('192.168.0.123')
			await save.done()

			const s2 = await simulate(subject)
			expect(s2('10.0.8.123')).toBe('10.0.8.123')
			await simulate.done()
		})
	}
)
incubator('non-primitive value are skipped (still work as normal)', (specName, spec) => {
	test(specName, async () => {
		spec.ignoreMismatch('192.168.0.123')
		const s = await spec((x: string) => x)
		const actual = s('192.168.0.123')
		expect(actual).toBe('192.168.0.123')
		await spec.done()
	})
})
incubator.sequence('on get', (specName, { save, simulate }) => {
	test(specName, async () => {
		save.ignoreMismatch(1)
		const spy = await save({ a: 1 })
		expect(spy.a).toBe(1)
		await save.done()

		const stub = await simulate({ a: 2 })
		expect(stub.a).toBe(1) // still get the saved value
		await simulate.done()
	})
})
incubator.sequence('on set', (specName, { save, simulate }) => {
	test(specName, async () => {
		const subject = { a: 1 }
		save.ignoreMismatch(2)
		const spy = await save(subject)
		spy.a = 2
		expect(spy.a).toBe(2)
		await save.done()

		const stub = await simulate(subject)
		stub.a = 3
		expect(stub.a).toBe(2) // still get the saved value
		await simulate.done()
	})
})
incubator.sequence('in invoke param', (specName, { save, simulate }) => {
	test(specName, async () => {
		const subject = (x: number) => x + 1
		save.ignoreMismatch(1)
		const spy = await save(subject)
		const actual = spy(1)
		expect(actual).toBe(2)
		await save.done()

		const stub = await simulate(subject)
		const actual2 = stub(100)
		expect(actual2).toBe(2) // still get the saved value
		await simulate.done()
	})
})
incubator.sequence('in invoke param array', (specName, { save, simulate }) => {
	test(specName, async () => {
		const subject = (x: number[]) => x[1]
		save.ignoreMismatch(1)
		const spy = await save(subject)
		const actual = spy([2, 1])
		expect(actual).toBe(1)
		await save.done()

		const stub = await simulate(subject)
		const actual2 = stub([2, 100])
		expect(actual2).toBe(1) // still get the saved value
		await simulate.done()
	})
})
incubator.sequence('in instantiate param', (specName, { save, simulate }) => {
	test(specName, async () => {
		class Subject {
			constructor(private value: number) {}
			getValue() {
				return this.value
			}
		}
		save.ignoreMismatch(1)
		const spy = await save(Subject)
		const actual = new spy(1)
		expect(actual.getValue()).toBe(1)
		await save.done()

		const stub = await simulate(Subject)
		const actual2 = new stub(100)
		expect(actual2.getValue()).toBe(1) // still get the saved value
		await simulate.done()
	})
})
