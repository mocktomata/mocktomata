import { a } from 'assertron'
import { createIncubator } from './incubator/create_incubator.js'
import { incubator } from './incubator/index.js'
import { ActionMismatch } from './index.js'
import { createTestContext } from './testing/index.js'

afterAll(() => incubator.cleanup())

function getUser(path: string) {
	return path.split('/').length
}

describe(`argumentMatching: 'behavior' (default)`, () => {
	incubator.sequence('a changed string argument is not compared', (specName, { save, simulate }) => {
		test(specName, async () => {
			const spy = await save(getUser)
			expect(spy('/users/1')).toBe(3)
			await save.done()

			const stub = await simulate(getUser)
			// replays the recording
			expect(stub('/users/12')).toBe(3)
			await simulate.done()
		})
	})

	incubator.sequence(
		'set explicitly, a changed string argument is not compared',
		{ argumentMatching: 'behavior' },
		(specName, { save, simulate }) => {
			test(specName, async () => {
				const spy = await save(getUser)
				spy('/users/1')
				await save.done()

				const stub = await simulate(getUser)
				expect(stub('/users/2')).toBe(3)
				await simulate.done()
			})
		}
	)

	incubator.sequence('a changed number argument names the level', (specName, { save, simulate }) => {
		test(specName, async () => {
			const subject = (x: number) => x
			const spy = await save(subject)
			spy(1)
			await save.done()

			const stub = await simulate(subject)
			const err = a.throws(() => stub(2), ActionMismatch)
			expect(err.argument).toEqual({ argumentMatching: 'behavior', index: 0 })
			expect(err.message).toContain(`argumentMatching: 'behavior'`)
			expect(err.message).toContain('spec.ignoreMismatch()')
			expect(err.message).toContain('spec.maskValue()')
		})
	})
})

describe(`argumentMatching: 'strings'`, () => {
	const options = { argumentMatching: 'strings' } as const

	incubator.sequence('the same string argument passes', options, (specName, { save, simulate }) => {
		test(specName, async () => {
			const spy = await save(getUser)
			expect(spy('/users/1')).toBe(3)
			await save.done()

			const stub = await simulate(getUser)
			expect(stub('/users/1')).toBe(3)
			await simulate.done()
		})
	})

	incubator.sequence('a changed string argument throws ActionMismatch', options, (specName, { save, simulate }) => {
		test(specName, async () => {
			const spy = await save(getUser)
			spy('/users/1')
			await save.done()

			const stub = await simulate(getUser)
			const err = a.throws(() => stub('/users/2'), ActionMismatch)
			expect(err.argument).toEqual({
				argumentMatching: 'strings',
				index: 0,
				strings: { expected: '/users/1', received: '/users/2' }
			})
			expect(err.message).toContain(`Argument 0 does not match the record (argumentMatching: 'strings')`)
			expect(err.message).toContain('expected: "/users/1"')
			expect(err.message).toContain('received: "/users/2"')
			expect(err.message).toContain('spec.ignoreMismatch()')
			expect(err.message).toContain('spec.maskValue()')
		})
	})

	incubator.sequence('names the argument that differs', options, (specName, { save, simulate }) => {
		test(specName, async () => {
			const subject = (method: string, path: string) => `${method} ${path}`
			const spy = await save(subject)
			spy('GET', '/users/1')
			await save.done()

			const stub = await simulate(subject)
			const err = a.throws(() => stub('GET', '/users/2'), ActionMismatch)
			a.satisfies(err.argument, { index: 1, strings: { expected: '/users/1', received: '/users/2' } })
		})
	})

	incubator.sequence('a repeated string argument passes', options, (specName, { save, simulate }) => {
		test(specName, async () => {
			const subject = (x: string, y: string) => x + y
			const spy = await save(subject)
			spy('a', 'a')
			await save.done()

			const stub = await simulate(subject)
			expect(stub('a', 'a')).toBe('aa')
			await simulate.done()
		})
	})

	incubator.sequence(
		'a changed string argument of `new` throws ActionMismatch',
		options,
		(specName, { save, simulate }) => {
			test(specName, async () => {
				class Client {
					constructor(private url: string) {}
					getUrl() {
						return this.url
					}
				}
				const spy = await save(Client)
				new spy('http://localhost:1')
				await save.done()

				const stub = await simulate(Client)
				const err = a.throws(() => new stub('http://localhost:2'), ActionMismatch)
				a.satisfies(err.argument, {
					argumentMatching: 'strings',
					index: 0,
					strings: { expected: 'http://localhost:1', received: 'http://localhost:2' }
				})
			})
		}
	)

	incubator.sequence('strings inside an object argument are not compared', options, (specName, { save, simulate }) => {
		test(specName, async () => {
			const subject = (o: { path: string }) => o.path.length
			const spy = await save(subject)
			spy({ path: '/users/1' })
			await save.done()

			const stub = await simulate(subject)
			expect(stub({ path: '/users/2' })).toBe(8)
			await simulate.done()
		})
	})

	incubator.sequence('strings inside an array argument are not compared', options, (specName, { save, simulate }) => {
		test(specName, async () => {
			const subject = (paths: string[]) => paths.length
			const spy = await save(subject)
			spy(['/users/1'])
			await save.done()

			const stub = await simulate(subject)
			expect(stub(['/users/2'])).toBe(1)
			await simulate.done()
		})
	})

	incubator.sequence('numbers are still compared', options, (specName, { save, simulate }) => {
		test(specName, async () => {
			const subject = (x: number) => x
			const spy = await save(subject)
			spy(1)
			await save.done()

			const stub = await simulate(subject)
			const err = a.throws(() => stub(2), ActionMismatch)
			expect(err.argument).toEqual({ argumentMatching: 'strings', index: 0 })
		})
	})

	incubator.sequence('a callback still receives the recorded string', options, (specName, { save, simulate }) => {
		test(specName, async () => {
			const subject = (cb: (value: string) => void) => cb('done')
			const spy = await save(subject)
			let saved = ''
			spy((v) => {
				saved = v
			})
			expect(saved).toBe('done')
			await save.done()

			const stub = await simulate(subject)
			let simulated = ''
			stub((v) => {
				simulated = v
			})
			expect(simulated).toBe('done')
			await simulate.done()
		})
	})

	describe('ignoreMismatch()', () => {
		incubator.sequence('a string passed to it is not compared', options, (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = (path: string, timestamp: string) => `${path}@${timestamp}`
				save.ignoreMismatch('2026-11-05')
				const spy = await save(subject)
				expect(spy('/users/1', '2026-11-05')).toBe('/users/1@2026-11-05')
				await save.done()

				const stub = await simulate(subject)
				expect(stub('/users/1', '2026-11-06')).toBe('/users/1@2026-11-05')
				await simulate.done()
			})
		})

		incubator.sequence('other strings are still compared', options, (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = (path: string, timestamp: string) => `${path}@${timestamp}`
				save.ignoreMismatch('2026-11-05')
				const spy = await save(subject)
				spy('/users/1', '2026-11-05')
				await save.done()

				const stub = await simulate(subject)
				const err = a.throws(() => stub('/users/2', '2026-11-06'), ActionMismatch)
				a.satisfies(err.argument, { index: 0 })
			})
		})
	})

	describe('maskValue()', () => {
		incubator.sequence('a masked string matches its recorded masked form', options, (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = (token: string) => token.length
				save.maskValue('secret-token')
				const spy = await save(subject)
				spy('secret-token')
				await save.done()

				simulate.maskValue('secret-token')
				const stub = await simulate(subject)
				expect(stub('secret-token')).toBe(12)
				await simulate.done()
			})
		})

		incubator.sequence(
			'a token that differs between runs matches when masked',
			options,
			(specName, { save, simulate }) => {
				test(specName, async () => {
					const subject = (header: string) => header.length
					save.maskValue(/token-\w+/)
					const spy = await save(subject)
					spy('Bearer token-abc')
					await save.done()

					simulate.maskValue(/token-\w+/)
					const stub = await simulate(subject)
					expect(stub('Bearer token-xyz')).toBe(16)
					await simulate.done()
				})
			}
		)

		incubator.sequence(
			'a mask added after saving also applies to the record',
			options,
			(specName, { save, simulate }) => {
				test(specName, async () => {
					const subject = (header: string) => header.length
					const spy = await save(subject)
					spy('Bearer token-abc')
					await save.done()

					simulate.maskValue(/token-\w+/)
					const stub = await simulate(subject)
					expect(stub('Bearer token-xyz')).toBe(16)
					await simulate.done()
				})
			}
		)

		incubator.sequence(
			'ActionMismatch does not print the masked value',
			options,
			(specName, { save, simulate }, reporter) => {
				test(specName, async () => {
					const subject = (url: string) => url.length
					save.maskValue('secret')
					const spy = await save(subject)
					spy('/users/1?key=secret')
					await save.done()

					simulate.maskValue('secret')
					const stub = await simulate(subject)
					const err = a.throws(() => stub('/users/2?key=secret'), ActionMismatch)
					expect(err.argument?.strings).toEqual({
						expected: '/users/1?key=[masked]',
						received: '/users/2?key=[masked]'
					})
					expect(err.message).toContain('received: "/users/2?key=[masked]"')
					expect(err.message).not.toContain('secret')
					expect(reporter.getLogMessage()).not.toContain('secret')
				})
			}
		)
	})
})

describe('ActionMismatch does not print raw argument values', () => {
	incubator.sequence('a string with no recorded reference is masked', (specName, { save, simulate }) => {
		test(specName, async () => {
			// Returns a number, so no other string reference is recorded.
			const subject = (x: string, y: string) => x.length + y.length
			save.maskValue('secret')
			const spy = await save(subject)
			spy('a', 'a')
			await save.done()

			simulate.maskValue('secret')
			const stub = await simulate(subject)
			// 'secret' finds no unused string reference, so it goes into the payload as is.
			const err = a.throws(() => stub('a', 'secret'), ActionMismatch)
			expect(err.message).toContain('[masked]')
			expect(err.message).not.toContain('secret')
		})
	})
})

describe('set property', () => {
	incubator.sequence('a masked string assigned in both runs passes', (specName, { save, simulate }) => {
		test(specName, async () => {
			save.maskValue('secret')
			const spy = await save({ token: '' })
			spy.token = 'secret'
			await save.done()

			simulate.maskValue('secret')
			const stub = await simulate({ token: '' })
			stub.token = 'secret'
			await simulate.done()
		})
	})

	incubator.sequence(
		'a changed masked string throws ActionMismatch without printing it',
		(specName, { save, simulate }) => {
			test(specName, async () => {
				save.maskValue('secret')
				const spy = await save({ url: '' })
				spy.url = '/users/1?key=secret'
				await save.done()

				simulate.maskValue('secret')
				const stub = await simulate({ url: '' })
				const err = a.throws(() => (stub.url = '/users/2?key=secret'), ActionMismatch)
				expect(err.message).not.toContain('secret')
			})
		}
	)

	incubator.sequence(
		'a string with no recorded reference left throws ActionMismatch',
		(specName, { save, simulate }) => {
			test(specName, async () => {
				const spy = await save({ a: '', c: '' })
				spy.a = 'x'
				spy.c = 'x'
				await save.done()

				const stub = await simulate({ a: '', c: '' })
				stub.a = 'x'
				a.throws(() => (stub.c = 'y'), ActionMismatch)
			})
		}
	)

	incubator.sequence(
		'a string taking over a reference already in use throws ActionMismatch',
		(specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = { a: '', f(_: string) {} }
				const spy = await save(subject)
				spy.f('x')
				spy.a = 'x'
				await save.done()

				const stub = await simulate(subject)
				stub.f('y')
				a.throws(() => (stub.a = 'y'), ActionMismatch)
			})
		}
	)
})

describe('config', () => {
	const configured = createIncubator(createTestContext({ config: { argumentMatching: 'strings' } }))
	afterAll(() => configured.cleanup())

	configured.sequence('the config applies to every spec', (specName, { save, simulate }) => {
		test(specName, async () => {
			const spy = await save(getUser)
			spy('/users/1')
			await save.done()

			const stub = await simulate(getUser)
			const err = a.throws(() => stub('/users/2'), ActionMismatch)
			a.satisfies(err.argument, { argumentMatching: 'strings' })
		})
	})

	configured.sequence(
		'the spec option overrides the config',
		{ argumentMatching: 'behavior' },
		(specName, { save, simulate }) => {
			test(specName, async () => {
				const spy = await save(getUser)
				spy('/users/1')
				await save.done()

				const stub = await simulate(getUser)
				expect(stub('/users/2')).toBe(3)
				await simulate.done()
			})
		}
	)
})
