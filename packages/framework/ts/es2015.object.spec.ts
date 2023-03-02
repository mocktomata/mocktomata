import { a } from 'assertron'
import { incubator } from './incubator/index.js'

incubator('get primitive property', (specName, spec) => {
	test(specName, async () => {
		const subject = await spec({ a: 1 })
		const actual = subject.a

		expect(actual).toBe(1)

		await spec.done()
	})
})

incubator('set primitive property', (specName, spec) => {
	test(specName, async () => {
		const subject = await spec({ a: 1 })
		const actual = (subject.a = 2)

		expect(actual).toBe(2)

		await spec.done()
	})
})

incubator('set object property', (specName, spec) => {
	test(specName, async () => {
		const subject = await spec({ a: { b: 1 } })
		const actual = (subject.a = { b: 2 })

		expect(actual).toEqual({ b: 2 })

		await spec.done()
	})
})

incubator('set function property', (specName, spec) => {
	test(specName, async () => {
		const subject = await spec({ a: (v: number) => v })
		const actual = (subject.a = (v: number) => v + 1)

		expect(actual(1)).toEqual(2)

		await spec.done()
	})
})

incubator('set null property', (specName, spec) => {
	test(specName, async () => {
		const subject = await spec({ a: { b: 1 } as any })
		const actual = (subject.a = null)

		expect(actual).toEqual(null)

		await spec.done()
	})
})

incubator('update primitive property', (specName, spec) => {
	test(specName, async () => {
		const subject = await spec({ a: 1 })
		expect(subject.a).toBe(1)
		subject.a = 2
		expect(subject.a).toBe(2)
		await spec.done()
	})
})

incubator('throw during get', (specName, spec) => {
	test(specName, async () => {
		const subject = await spec({
			get x() {
				throw new Error('thrown')
			}
		})
		a.throws(
			() => subject.x,
			e => e.message === 'thrown'
		)
		await spec.done()
	})
})

incubator('throw during set', (specName, spec) => {
	test(specName, async () => {
		const subject = await spec({
			set x(_: number) {
				throw new Error('thrown')
			}
		})
		a.throws(
			() => (subject.x = 2),
			e => e.message === 'thrown'
		)
		await spec.done()
	})
})

incubator('handles property changes type from value to function', (specName, spec) => {
	test(specName, async () => {
		const subject: any = await spec({ do: 1 })
		subject.do = (v: number) => v
		expect(subject.do(3)).toBe(3)
		await spec.done()
	})
})

incubator('primitive method', (specName, spec) => {
	test(specName, async () => {
		const subject = await spec({ echo: (x: number) => x })
		const actual = subject.echo(3)

		expect(actual).toBe(3)

		await spec.done()
	})
})

incubator('primitive method throws error', (specName, spec) => {
	test(specName, async () => {
		const subject = await spec({
			echo: (x: string) => {
				throw new Error(x)
			}
		})
		const err = a.throws(() => subject.echo('abc'))

		expect(err.message).toBe('abc')

		await spec.done()
	})
})

incubator.sequence('object property is mocked', (specName, { save, simulate }) => {
	test(specName, async () => {
		const spy = await save({
			a: {
				do() {
					return 1
				}
			}
		})

		expect(spy.a.do()).toBe(1)

		await save.done()

		const stub = await simulate({
			a: {
				do() {
					throw new Error('should not reach')
				}
			}
		})

		expect(stub.a.do()).toBe(1)

		await simulate.done()
	})
})

incubator('callback method success', (specName, spec) => {
	test(specName, async () => {
		const subject = await spec({
			inc(x: number, cb: (x: number) => void) {
				cb(x + 1)
			}
		})
		let actual: number
		subject.inc(3, x => (actual = x))

		expect(actual!).toBe(4)

		await spec.done()
	})
})

incubator('same child in two properties', (specName, spec) => {
	test(specName, async () => {
		const child = { a: 1 }
		const subject = { x: child, y: child }
		const s = await spec(subject)
		expect(s.x.a).toBe(1)
		expect(s.y.a).toBe(1)

		s.x.a = 2
		expect(s.y.a).toBe(2)
		await spec.done()
	})
})

incubator('circular child properties', (specName, spec) => {
	test(specName, async () => {
		const subject: any = { a: 1 }
		subject.s = subject

		const s = await spec(subject)
		expect(s.a).toBe(1)
		expect(s.s.a).toBe(1)
		expect(s.s.s.a).toBe(1)

		s.a = 2
		expect(s.s.a).toBe(2)
		await spec.done()
	})
})

// version 8
incubator('modify out array param', (specName, spec) => {
	test.skip(specName, async () => {
		const s = await spec({
			getArray() {
				return ['a', 'b']
			},
			updateArray(arr: string[]) {
				arr[1] = 'c'
			}
		})

		const arr = s.getArray()
		s.updateArray(arr)
		expect(arr).toEqual(['a', 'c'])
		await spec.done()
	})
})

// version 8
incubator.sequence('method skips internal method calls', (specName, { save, simulate }) => {
	test.skip(specName, async () => {
		const spy = await save({
			foo() {
				this.internalCall()
				return 'ok'
			},
			internalCall() {}
		})
		expect(spy.foo()).toBe('ok')
		await save.done()
		const stub = await simulate({
			foo() {
				this.internalCall()
				return 'ok'
			},
			internalCall() {
				throw new Error('should not reach')
			}
		})
		expect(stub.foo()).toBe('ok')
		await simulate.done()
	})
})
