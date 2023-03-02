import type { AnyFunction } from 'type-plus'
import { incubator } from './incubator/index.js'

const promise = {
	increment(remote: any, x: number) {
		return remote('increment', x)
	},
	success(_url: string, x: number) {
		return Promise.resolve(x + 1)
	},
	fail() {
		return Promise.reject(new Error('expected error'))
	}
}

const promiseChain = {
	increment(remote: any, x: number) {
		return remote('increment', x)
	},
	success(_url: string, x: number) {
		return new Promise(a => {
			setTimeout(a, 1)
		}).then(() => Promise.resolve(() => x + 1))
	},
	fail() {
		return new Promise(a => {
			setTimeout(a, 1)
		}).then(() => Promise.reject(() => new Error('expected error')))
	}
}

const noReturn = {
	doSomething(remote: AnyFunction) {
		return remote()
	},
	success() {
		return Promise.resolve()
	}
}

incubator('resolve with no value', (specName, spec) => {
	test(specName, async () => {
		const subject = await spec(noReturn.success)
		await noReturn.doSomething(subject).then((v: any) => {
			expect(v).toBeUndefined()
			return spec.done()
		})
	})
})

incubator('resolve with value', (specName, spec) => {
	test(specName, async () => {
		const subject = await spec(promise.success)
		// not using `await` to make sure the return value is a promise.
		// `await` will hide the error if the return value is not a promise.
		return promise.increment(subject, 2).then((actual: number) => {
			expect(actual).toBe(3)
			return spec.done()
		})
	})
})

incubator('reject with error', (specName, spec) => {
	test(specName, async () => {
		const subject = await spec(promise.fail)
		return promise
			.increment(subject, 2)
			.then(() => {
				throw new Error('should not reach')
			})
			.catch(async (e: Error) => {
				expect(e.message).toBe('expected error')
				await spec.done()
			})
	})
})

incubator('promise with callback in between', (specName, spec) => {
	test(specName, async () => {
		function foo(x: number, cb: AnyFunction) {
			return new Promise(a => {
				setTimeout(() => {
					cb('called')
					a(x + 1)
				}, 10)
			})
		}
		const subject = await spec(foo)

		let fooing: any
		return new Promise<void>(a => {
			fooing = subject(2, (msg: string) => {
				expect(msg).toBe('called')
				a()
			})
		})
			.then(() => fooing)
			.then(actual => {
				expect(actual).toBe(3)
				return spec.done()
			})
	})
})

incubator('promise resolves to function', (specName, spec) => {
	test(specName, async () => {
		const subject = await spec(promiseChain.success)
		// not using `await` to make sure the return value is a promise.
		// `await` will hide the error if the return value is not a promise.
		return promise.increment(subject, 2).then(async (actualFn: AnyFunction) => {
			expect(actualFn()).toBe(3)
			await spec.done()
		})
	})
})
