import { incubator } from './incubator/index.js'

function giveSymbol() {
	return Symbol.for('abc')
}

incubator('handles keyed symbol as return value', (specName, spec) => {
	it(specName, async () => {
		const s = await spec(giveSymbol)
		expect(s()).toEqual(Symbol.for('abc'))
		await spec.done()
	})
})

function takeSymbol(sym: symbol) {
	return sym
}
incubator('handles keyed symbol as input value', (specName, spec) => {
	it(specName, async () => {
		const s = await spec(takeSymbol)
		expect(s(Symbol.for('abc'))).toEqual(Symbol.for('abc'))
		await spec.done()
	})
})

incubator.sequence('reads a well-known symbol property', (specName, { save, simulate }) => {
	test(specName, async () => {
		const spy = await save({ [Symbol.toStringTag]: 'Foo', a: 1 })
		expect(spy[Symbol.toStringTag]).toBe('Foo')
		expect(spy.a).toBe(1)
		await save.done()

		const stub = await simulate({ [Symbol.toStringTag]: 'Bar', a: 2 })
		expect(stub[Symbol.toStringTag]).toBe('Foo')
		expect(stub.a).toBe(1)
		await simulate.done()
	})
})

incubator.sequence('writes a well-known symbol property', (specName, { save, simulate }) => {
	test(specName, async () => {
		const spy: Record<PropertyKey, any> = await save({ a: 1 })
		spy[Symbol.toStringTag] = 'Foo'
		await save.done()

		const stub: Record<PropertyKey, any> = await simulate({ a: 1 })
		stub[Symbol.toStringTag] = 'Foo'
		await simulate.done()
	})
})

incubator.sequence('mismatched well-known symbol key is not matched', (specName, { save, simulate }) => {
	test(specName, async () => {
		const spy: Record<PropertyKey, any> = await save({ [Symbol.toStringTag]: 'Foo' })
		expect(spy[Symbol.toStringTag]).toBe('Foo')
		await save.done()

		const stub: Record<PropertyKey, any> = await simulate({ [Symbol.toStringTag]: 'Foo' })
		expect(stub[Symbol.unscopables]).toBeUndefined()
		expect(stub[Symbol.toStringTag]).toBe('Foo')
		await simulate.done()
	})
})

incubator.sequence('reads and writes a registered symbol property', (specName, { save, simulate }) => {
	test(specName, async () => {
		const key = Symbol.for('abc')
		const spy: Record<PropertyKey, any> = await save({ [key]: 1 })
		expect(spy[key]).toBe(1)
		spy[key] = 2
		await save.done()

		const stub: Record<PropertyKey, any> = await simulate({ [key]: 3 })
		expect(stub[key]).toBe(1)
		stub[key] = 2
		await simulate.done()
	})
})

incubator.sequence('a different registered symbol does not match', (specName, { save, simulate }) => {
	test(specName, async () => {
		const spy: Record<PropertyKey, any> = await save({ [Symbol.for('abc')]: 1 })
		expect(spy[Symbol.for('abc')]).toBe(1)
		await save.done()

		const stub: Record<PropertyKey, any> = await simulate({ [Symbol.for('abc')]: 1 })
		expect(stub[Symbol.for('def')]).toBeUndefined()
		expect(stub[Symbol.for('abc')]).toBe(1)
		await simulate.done()
	})
})

incubator.sequence('reads and writes a unique symbol property', (specName, { save, simulate }) => {
	test(specName, async () => {
		const k1 = Symbol('k1')
		const k2 = Symbol('k2')
		const spy: Record<PropertyKey, any> = await save({ [k1]: 1, [k2]: 2 })
		expect(spy[k2]).toBe(2)
		expect(spy[k1]).toBe(1)
		spy[k2] = 3
		await save.done()

		// new symbols, as a new process would create them
		const n1 = Symbol('k1')
		const n2 = Symbol('k2')
		const stub: Record<PropertyKey, any> = await simulate({ [n1]: 0, [n2]: 0 })
		expect(stub[n2]).toBe(2)
		expect(stub[n1]).toBe(1)
		stub[n2] = 3
		await simulate.done()
	})
})

incubator.sequence('unique symbols are matched by access order', (specName, { save, simulate }) => {
	test(specName, async () => {
		const k1 = Symbol('k')
		const k2 = Symbol('k')
		const spy: Record<PropertyKey, any> = await save({ [k1]: 1, [k2]: 2 })
		expect(spy[k1]).toBe(1)
		expect(spy[k2]).toBe(2)
		expect(spy[k1]).toBe(1)
		await save.done()

		const n1 = Symbol('k')
		const n2 = Symbol('k')
		const stub: Record<PropertyKey, any> = await simulate({})
		expect(stub[n1]).toBe(1)
		expect(stub[n2]).toBe(2)
		expect(stub[n1]).toBe(1)
		await simulate.done()
	})
})

incubator.sequence('iterates a spec object with for...of', (specName, { save, simulate }) => {
	test(specName, async () => {
		const subject = {
			*[Symbol.iterator]() {
				yield 1
				yield 2
			}
		}
		const spy = await save(subject)
		const saved: number[] = []
		for (const v of spy) saved.push(v)
		expect(saved).toEqual([1, 2])
		await save.done()

		const stub = await simulate({
			[Symbol.iterator](): Iterator<number> {
				throw new Error('should not reach')
			}
		})
		const simulated: number[] = []
		for (const v of stub) simulated.push(v)
		expect(simulated).toEqual([1, 2])
		await simulate.done()
	})
})

incubator.sequence('iterates a spec object from a function with for...of', (specName, { save, simulate }) => {
	test(specName, async () => {
		function getItems() {
			return {
				*[Symbol.iterator]() {
					yield 'a'
					yield 'b'
				}
			}
		}
		const spy = await save(getItems)
		expect([...spy()]).toEqual(['a', 'b'])
		await save.done()

		const stub = await simulate(getItems)
		expect([...stub()]).toEqual(['a', 'b'])
		await simulate.done()
	})
})
