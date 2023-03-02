import { incubator } from './incubator/index.js'

incubator(`empty array`, (specName, spec) => {
	it(specName, async () => {
		const subject = await spec((v: any[]) => v)
		const actual = subject([])

		expect(actual).toEqual([])

		await spec.done()
	})
})
incubator(`object array`, (specName, spec) => {
	it(specName, async () => {
		const subject = await spec((v: any[]) => v)
		const actual = subject([{ a: 1 }])
		expect(actual).toEqual([{ a: 1 }])

		await spec.done()
	})
})
incubator(`stub primitive array`, (specName, spec) => {
	it(specName, async () => {
		const subject = await spec(() => [1, true, 'abc'])
		const actual = subject()

		expect(actual).toEqual([1, true, 'abc'])

		await spec.done()
	})
})
incubator(`stub object array`, (specName, spec) => {
	it(specName, async () => {
		const subject = await spec(() => [{ a: 1 }])
		const actual = subject()

		expect(actual[0]).toEqual({ a: 1 })
		expect(actual).toEqual([{ a: 1 }])

		await spec.done()
	})
})
incubator(`extended array`, (specName, spec) => {
	// while extending array object is not recommended,
	// this make sure we handles the unique nature of it
	it(specName, async () => {
		const s = await spec(() =>
			Object.assign([1, 2, 3], {
				hiddenValue: 4,
				foo() {
					return 'foo'
				}
			})
		)
		const r = s()
		expect(r[0]).toEqual(1)
		expect(r[1]).toEqual(2)
		expect(r[2]).toEqual(3)
		expect(r.hiddenValue).toEqual(4)
		expect(r.foo()).toEqual('foo')
		await spec.done()
	})
})

incubator('supports change value in returned array', (specName, spec) => {
	it(specName, async () => {
		const s = await spec(() => [1, 2, 3])
		const r = s()
		r[1] = 4
		expect(r[1]).toEqual(4)
		await spec.done()
	})
})

incubator(`using returned array built-in function`, (specName, spec) => {
	it(specName, async () => {
		const s = await spec(() => [1, 2, 3])
		const r = s().map(x => x + 1)
		expect(r).toEqual([2, 3, 4])
		await spec.done()
	})
})
