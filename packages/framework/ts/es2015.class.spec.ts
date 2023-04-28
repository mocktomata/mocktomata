import 'setimmediate'
import { a } from 'assertron'
import type { AnyFunction } from 'type-plus'
import { incubator } from './incubator/index.js'
import { ActionMismatch, ExtraAction } from './index.js'
import {
	ChildOfDummy,
	Dummy,
	WithProperty,
	WithStaticMethod,
	WithStaticProp
} from './test_artifacts/index.js'

class Foo {
	constructor(public x: number) {}
	getValue() {
		return this.x
	}
}

class Boo extends Foo {
	getPlusOne() {
		return this.getValue() + 1
	}
}

incubator('invoke declared method', (specName, spec) => {
	test(specName, async () => {
		const Subject = await spec(Foo)
		const instance = new Subject(1)
		expect(instance.getValue()).toBe(1)
		await spec.done()
	})
})

incubator('invoke sub-class method', (specName, spec) => {
	test(specName, async () => {
		const Subject = await spec(Boo)

		const instance = new Subject(1)
		expect(instance.getPlusOne()).toBe(2)
		await spec.done()
	})
})

incubator('invoke parent method', (specName, spec) => {
	test(specName, async () => {
		const Subject = await spec(Boo)

		const instance = new Subject(1)
		expect(instance.getValue()).toBe(1)
		await spec.done()
	})
})

incubator('create multiple instances of the same class', (specName, spec) => {
	test(specName, async () => {
		const Subject = await spec(Foo)
		const f1 = new Subject(1)
		const f2 = new Subject(2)
		expect(f1.getValue()).toBe(1)
		expect(f2.getValue()).toBe(2)
		await spec.done()
	})
})

incubator.sequence('ok to use super/sub-class as long as behavior is the same', (specName, specs) => {
	// It is ok to use diff
	test(specName, async () => {
		const save = specs.save
		const bs = await save(Boo)
		const boo = new bs(2)
		expect(boo.getValue()).toBe(2)
		await save.done()

		const sim = specs.simulate
		const fs = await sim(Foo)
		const foo = new fs(2)
		expect(foo.getValue()).toBe(2)
		await sim.done()
	})
})

class WithCallback {
	callback(cb: (value: number) => void) {
		setImmediate(() => {
			cb(1)
		})
	}
	justDo(x: any) {
		return x
	}
}
incubator('class method with callback', (specName, spec) => {
	test(specName, async () => {
		const s = await spec(WithCallback)
		const cb = new s()

		expect(cb.justDo(1)).toBe(1)
		expect(
			await new Promise(a => {
				let total = 0
				cb.callback(v => (total += v))
				cb.callback(v => a(total + v))
			})
		).toBe(2)
		await spec.done()
	})
})

class Throwing {
	doThrow() {
		throw new Error('thrown')
	}
}

incubator('invoke method throws', (specName, spec) => {
	test(specName, async () => {
		const Subject = await spec(Throwing)
		const foo = new Subject()
		a.throws(
			() => foo.doThrow(),
			e => e.message === 'thrown'
		)
		await spec.done()
	})
})

class ResolvedPromise {
	increment(x: number) {
		return Promise.resolve(x + 1)
	}
}

class DelayedPromise {
	increment(x: number) {
		return new Promise(a => {
			setImmediate(() => a(x + 1))
		})
	}
}
incubator('method return resolved promise', (specName, spec) => {
	test(specName, async () => {
		const Subject = await spec(ResolvedPromise)
		const p = new Subject()
		expect(await p.increment(3)).toBe(4)

		await spec.done()
	})
})

incubator('method returns delayed promise', (specName, spec) => {
	test(specName, async () => {
		const Subject = await spec(DelayedPromise)
		const p = new Subject()
		expect(await p.increment(3)).toBe(4)

		await spec.done()
	})
})

incubator('invoke method returns delayed promise multiple times', (specName, spec) => {
	test(specName, async () => {
		const Subject = await spec(DelayedPromise)
		const p = new Subject()
		expect(await Promise.all([p.increment(1), p.increment(3), p.increment(7)])).toEqual([2, 4, 8])

		await spec.done()
	})
})

class InvokeInternal {
	do() {
		return this.internal()
	}
	internal() {
		return 'data'
	}
}

incubator('method invokes internal method', (specName, spec) => {
	test(specName, async () => {
		const Subject = await spec(InvokeInternal)
		const a = new Subject()
		expect(a.do()).toBe('data')

		await spec.done()
	})
})

class DelayedInvokeInternal {
	getDelayedInner(delay = 0) {
		return new Promise(a => {
			setTimeout(() => {
				a(this.inner())
			}, delay)
		})
	}
	inner() {
		return 'inner'
	}
}
incubator('method delay invokes internal method', (specName, spec) => {
	test(specName, async () => {
		const Subject = await spec(DelayedInvokeInternal)
		const a = new Subject()
		expect(await a.getDelayedInner()).toBe('inner')
		expect(a.inner()).toBe('inner')

		await spec.done()
	})
})

incubator.sequence('actual method is not invoked during simulation', (specName, { save, simulate }) => {
	test(specName, async () => {
		const Subject = await save(DelayedInvokeInternal)
		const dii = new Subject()

		expect(await dii.getDelayedInner()).toBe('inner')
		await save.done()
		{
			class DelayedInvokeInternal {
				getDelayedInner() {
					throw new Error('should not call')
				}
			}
			const BadSubject = await simulate(DelayedInvokeInternal)
			const bad = new BadSubject()
			expect(await bad.getDelayedInner()).toBe('inner')
			await simulate.done()
		}
	})
})

class RejectLeak {
	reject(x: number) {
		return new Promise((_, r) => {
			setImmediate(() => r(x))
		})
	}
}

incubator('runaway promise will not be leaked and break another test', (specName, spec) => {
	test(`${specName}: setup`, async () => {
		const MockRejector = await spec(RejectLeak)
		const e = new MockRejector()
		await a.throws(e.reject(300), v => v === 300)
		await spec.done()
	})
	test(`${specName}: should not fail`, () => {
		return new Promise<void>(a => setImmediate(() => a()))
	})
})

class WithCircular {
	value: any
	cirRef: WithCircular
	constructor() {
		this.cirRef = this
	}
}

class ClassWithCircular {
	channel: WithCircular
	constructor() {
		this.channel = new WithCircular()
	}
	exec(cmd: string, cb: AnyFunction) {
		this.channel.value = cmd
		cb(this.channel)
	}
}

incubator('can use class with circular reference', (specName, spec) => {
	test(specName, async () => {
		const Subject = await spec(ClassWithCircular)
		const f = new Subject()

		let actual
		f.exec('echo', (channel: any) => {
			actual = channel.value
		})

		expect(actual).toBe('echo')
		await spec.done()
	})
})

incubator('class with circular reference accessing', (specName, spec) => {
	test(specName, async () => {
		const Subject = await spec(ClassWithCircular)
		const f = new Subject()

		let actual
		f.exec('echo', (channel: WithCircular) => {
			actual = channel.cirRef.value
		})

		expect(actual).toBe('echo')
		await spec.done()
	})
})

class Channel {
	listeners: any[] = []
	stdio: any
	constructor() {
		this.stdio = this
	}
	on(listener: any) {
		this.listeners.push(listener)
	}
	emit(data: any) {
		this.listeners.forEach(l => l(data))
	}
}
class Ssh {
	channel: Channel
	constructor() {
		this.channel = new Channel()
	}
	exec(cmd: string, cb: AnyFunction) {
		cb(this.channel)
		this.channel.stdio.emit(cmd)
	}
}

// TODO: throws NotSupported error for callback with complex object.
// This gives indication to the user that a plugin is need to support this subject
// To fix this, I need to:
// 1. get property key and value from object without invoking getter.
// 2. Add GetAction SetAction back
incubator('callback with complex object', (specName, spec) => {
	test(specName, async () => {
		const Subject = await spec(Ssh)
		const f = new Subject()

		let actual
		f.exec('echo', (channel: any) => channel.stdio.on((data: any) => (actual = data)))

		expect(actual).toBe('echo')
		await spec.done()
	})
})

incubator('use composite callback function', (specName, spec) => {
	test(specName, async () => {
		class Foo {
			on(compositeFn: any) {
				return this.internal(compositeFn)
			}
			internal(input: any) {
				expect(input.value).toBe('xyz')
				return input
			}
		}
		const fn = Object.assign(
			function () {
				return
			},
			{
				value: 'xyz'
			}
		)
		const s = await spec(Foo)
		const f = new s()
		const actual = f.on(fn)

		expect(actual.value).toBe('xyz')

		await spec.done()
	})
})

incubator('class with property', (specName, spec) => {
	test(specName, async () => {
		const s = await spec(WithProperty)
		const p = new s()
		expect(p.do(2)).toBe(2)
		expect(p.y).toBe(1)
		p.y = 3
		expect(p.y).toBe(3)
		await spec.done()
	})
})

incubator('static property', (specName, spec) => {
	test(specName, async () => {
		const s = await spec(WithStaticProp)
		expect(s.x).toBe(1)
		expect((s.x = 3)).toBe(3)
		await spec.done()
	})
})

incubator('static method', (specName, spec) => {
	test(specName, async () => {
		const s = await spec(WithStaticMethod)
		expect(s.do()).toBe('foo')
		await spec.done()
	})
})

incubator('passes instanceof test for 1st level class', (specName, spec) => {
	test(specName, async () => {
		const S = await spec(Dummy)
		const s = new S()
		expect(s).toBeInstanceOf(Dummy)
		await spec.done()
	})
})

incubator('passes instanceof test for sub class', (specName, spec) => {
	test(specName, async () => {
		const S = await spec(ChildOfDummy)
		const s = new S()
		expect(s).toBeInstanceOf(ChildOfDummy)
		expect(s).toBeInstanceOf(Dummy)
		await spec.done()
	})
})

describe('instantiate', () => {
	class Subject {
		a = 0
		constructor(..._args: any[]) {}
		// must exist at least one method for class plugin to identify it.
		foo() {}
	}
	incubator.sequence('missing call emits log', (specName, { save, simulate }, reporter) => {
		test(specName, async () => {
			const spy = await save(Subject)
			new spy()
			await save.done()

			await simulate(Subject)
			await simulate.done()
			expect(reporter.getLogMessage()).toMatch(/when the simulation is done/)
		})
	})
	incubator.sequence('extra call throws ExtraAction', (specName, { save, simulate }) => {
		test(specName, async () => {
			await save(Subject)
			await save.done()
			const stub = await simulate(Subject)
			a.throws(() => new stub(), ExtraAction)
		})
	})
	incubator.sequence('in place of different action throws ActionMismatch', (specName, { save, simulate }) => {
		test(specName, async () => {
			const spy = await save(Subject)
			new spy().a = 0
			await save.done()

			const stub = await simulate(Subject)
			new stub()
			a.throws(() => new stub(), ActionMismatch)
		})
	})
	incubator.sequence('with extra param throws ActionMismatch', (specName, { save, simulate }) => {
		test(specName, async () => {
			const spy = await save(Subject)
			new spy('a')
			await save.done()
			const stub = await simulate(Subject)
			a.throws(() => new stub('a', 'b'), ActionMismatch)
		})
	})
	incubator.sequence('with missing param throws ActionMismatch', (specName, { save, simulate }) => {
		test(specName, async () => {
			const s = await save(Subject)
			new s('a')
			await save.done()
			const stub = await simulate(Subject)
			a.throws(() => new stub(), ActionMismatch)
		})
	})
})
