import { a } from 'assertron'
import { IsoError } from 'iso-error'
import { HttpError } from 'iso-error-web'
import { ActionMismatch, incubator } from './index.js'
import { ChildOfDummy, Dummy, WithStaticMethod, WithStaticProp } from './test_artifacts/index.js'

incubator('spec the class first to support instanceof for output instance', (specName, spec) => {
	test(specName, async () => {
		function fool() {
			return new ChildOfDummy()
		}
		await spec(ChildOfDummy)
		const f = await spec(fool)
		const s = f()
		expect(s).toBeInstanceOf(ChildOfDummy)
		expect(s).toBeInstanceOf(Dummy)
		await spec.done()
	})
})

incubator('instanceof for output instance if the class was used through input', (specName, spec) => {
	test(specName, async () => {
		const subject = {
			in(_: any) {
				return
			},
			out() {
				return new ChildOfDummy()
			}
		}
		const s = await spec(subject)
		s.in(new ChildOfDummy())
		const actual = s.out()
		expect(actual).toBeInstanceOf(ChildOfDummy)
		expect(actual).toBeInstanceOf(Dummy)
		await spec.done()
	})
})

incubator.sequence('getter skips internal method calls', (specName, { save, simulate }) => {
	test(specName, async () => {
		const spy = await save({
			get side() {
				this.internalCall()
				return 'ok'
			},
			internalCall() {}
		})
		expect(spy.side).toBe('ok')
		await save.done()

		const stub = await simulate({
			get side() {
				this.internalCall()
				return 'ok'
			},
			internalCall() {
				throw new Error('should not reach')
			}
		})
		expect(stub.side).toBe('ok')
		await simulate.done()
	})
})

incubator.sequence('setter skips internal method calls', (specName, { save, simulate }) => {
	test(specName, async () => {
		const spy = await save({
			set side(v: any) {
				this.internalCall()
			},
			internalCall() {}
		})
		spy.side = 1
		await save.done()

		const stub = await simulate({
			set side(v: any) {
				this.internalCall()
			},
			internalCall() {
				throw new Error('should not reach')
			}
		})
		stub.side = 1
		await simulate.done()
	})
})

incubator.sequence('method skips internal method calls', (specName, { save, simulate }) => {
	test(specName, async () => {
		let shouldThrow = false
		class InvokeInternal {
			foo() {
				this.internalCall()
				return 'ok'
			}
			internalCall() {
				if (shouldThrow) throw new Error('should not reach')
			}
		}
		const instance = new InvokeInternal()
		const spy = await save(instance)
		expect(spy.foo()).toBe('ok')
		await save.done()
		shouldThrow = true

		const stub = await simulate(instance)
		expect(stub.foo()).toBe('ok')
		await simulate.done()
	})
})

incubator('returning this is same as spy', (specName, spec) => {
	test(specName, async () => {
		class Fluent {
			foo() {
				return this
			}
		}

		const spy = await spec(new Fluent())
		expect(spy.foo()).toBe(spy)
		await spec.done()
	})
})

incubator('static property', (specName, spec) => {
	test(specName, async () => {
		WithStaticProp.x = 1
		function getClass() {
			return WithStaticProp
		}
		const subject = await spec(getClass)
		const s = subject()
		expect(s.x).toBe(1)
		expect((s.x = 3)).toBe(3)
		await spec.done()
	})
})

incubator('static method', (specName, spec) => {
	test(specName, async () => {
		function getClass() {
			return WithStaticMethod
		}

		const subject = await spec(getClass)
		const s = subject()
		expect(s.do()).toBe('foo')
		await spec.done()
	})
})

incubator('constructor throws error', (specName, spec) => {
	test(specName, async () => {
		class Throw {
			constructor(x: string) {
				throw new Error(x)
			}
			// need this dummy method for the system to detect this is a class
			foo() {}
		}
		const s = await spec({ Throw })
		const err = a.throws(() => new s.Throw('abc'))

		expect(err.message).toBe('abc')

		await spec.done()
	})
})

incubator.sequence('instantiate with wrong primitive argument', (specName, { save, simulate }) => {
	test(specName, async () => {
		class EchoConstructorArg {
			constructor(public value: number) {}
			echo() {
				return this.value
			}
		}

		const s = await save({ EchoConstructorArg })
		new s.EchoConstructorArg(1)
		await save.done()

		const s2 = await simulate({ EchoConstructorArg })
		a.throws(() => new s2.EchoConstructorArg(2), ActionMismatch)
	})
})

incubator.sequence(
	'instantiate with different argument is okay as long as behavior does not change',
	(specName, { save, simulate }) => {
		test(specName, async () => {
			class EchoConstructorArg {
				constructor(public value: string) {}
				echo() {
					return this.value
				}
			}

			const s = await save({ EchoConstructorArg })
			new s.EchoConstructorArg('abc')
			await save.done()

			const s2 = await simulate({ EchoConstructorArg })
			new s2.EchoConstructorArg('xyz')
			await simulate.done()
		})
	}
)

incubator('ioc instantiate class', (specName, spec) => {
	test(specName, async () => {
		class Dummy {
			foo() {}
		}
		const s = await spec((subject: any) => new subject())
		expect(s(Dummy)).toBeInstanceOf(Dummy)

		await spec.done()
	})
})

incubator(
	`instantiate parent class`,
	(specName, spec) => {
		it(specName, async () => {
			function willThrow() {
				throw new HttpError(424, 'pre cond', { cause: new IsoError('internal cause') })
			}
			await spec(HttpError)
			const s = await spec(willThrow)
			const e = a.throws(s, HttpError)
			expect(e).toBeInstanceOf(HttpError)
			expect(e.cause).toBeInstanceOf(IsoError)
			await spec.done()
		})
	}
)
