import { a } from 'assertron'
import { incubator } from '../incubator/index.js'
import { json } from '../json.js'
import type { SpecRecord } from '../spec_record/types.js'
import { logLevels } from '../standard_log.types.js'
import { createTestContext } from '../testing/index.js'
import { createZucchini } from '../zucchini/index.js'
import { ActionMismatch } from './errors.js'
import type { Spec } from './types.js'

// The secret of the recording run and the secret of the replaying run.
// They differ, as a CI token differs from a developer's token.
const savedSecret = 'tok-saved-7f3a'
const runSecret = 'tok-run-c91e'

afterAll(() => incubator.cleanup())

function expectNoSecret(text: string) {
	expect(text).not.toContain(savedSecret)
	expect(text).not.toContain(runSecret)
}

describe('maskValue(value, { restore: true })', () => {
	describe('restores this run value in place of the placeholder', () => {
		incubator.sequence('in a return value', { logLevel: logLevels.all }, (specName, { save, simulate }, reporter) => {
			test(specName, async () => {
				save.maskValue(savedSecret, { restore: true })
				const spy = await save((secret: string) => () => secret)
				const login = spy(savedSecret)
				expect(login()).toBe(savedSecret)
				await save.done()

				simulate.maskValue(runSecret, { restore: true })
				const stub = await simulate((secret: string) => () => secret)
				expect(stub(runSecret)()).toBe(runSecret)
				await simulate.done()
				expectNoSecret(reporter.getLogMessage())
			})
		})

		incubator.sequence('inside a longer string', (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = { header: () => `Bearer ${savedSecret}` }
				save.maskValue(savedSecret, { restore: true })
				const spy = await save(subject)
				expect(spy.header()).toBe(`Bearer ${savedSecret}`)
				await save.done()

				simulate.maskValue(runSecret, { restore: true })
				const stub = await simulate(subject)
				expect(stub.header()).toBe(`Bearer ${runSecret}`)
				await simulate.done()
			})
		})

		incubator.sequence('each occurrence in a string', (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = { pair: () => `${savedSecret}:${savedSecret}` }
				save.maskValue(savedSecret, { restore: true })
				const spy = await save(subject)
				spy.pair()
				await save.done()

				simulate.maskValue(runSecret, { restore: true })
				const stub = await simulate(subject)
				expect(stub.pair()).toBe(`${runSecret}:${runSecret}`)
				await simulate.done()
			})
		})

		incubator.sequence('with a custom replaceWith', (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = { token: () => savedSecret }
				save.maskValue(savedSecret, { replaceWith: '[token]', restore: true })
				const spy = await save(subject)
				spy.token()
				const record = await save.done()
				expect(json.stringify(record)).toContain('[token]')

				simulate.maskValue(runSecret, { replaceWith: '[token]', restore: true })
				const stub = await simulate(subject)
				expect(stub.token()).toBe(runSecret)
				await simulate.done()
			})
		})

		incubator.sequence('in a value nested in a returned object', (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = { session: () => ({ auth: { token: savedSecret } }) }
				save.maskValue(savedSecret, { restore: true })
				const spy = await save(subject)
				expect(spy.session().auth.token).toBe(savedSecret)
				await save.done()

				simulate.maskValue(runSecret, { restore: true })
				const stub = await simulate(subject)
				expect(stub.session().auth.token).toBe(runSecret)
				await simulate.done()
			})
		})

		incubator.sequence('in a value nested in a returned array', (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = { tokens: () => ['x', savedSecret] }
				save.maskValue(savedSecret, { restore: true })
				const spy = await save(subject)
				expect(spy.tokens()[1]).toBe(savedSecret)
				await save.done()

				simulate.maskValue(runSecret, { restore: true })
				const stub = await simulate(subject)
				expect(stub.tokens()[1]).toBe(runSecret)
				await simulate.done()
			})
		})

		incubator.sequence('in a resolved promise', (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = { fetchToken: () => Promise.resolve(savedSecret) }
				save.maskValue(savedSecret, { restore: true })
				const spy = await save(subject)
				expect(await spy.fetchToken()).toBe(savedSecret)
				await save.done()

				simulate.maskValue(runSecret, { restore: true })
				const stub = await simulate(subject)
				expect(await stub.fetchToken()).toBe(runSecret)
				await simulate.done()
			})
		})

		incubator.sequence('in a property of a thrown error', (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = {
					fail: () => {
						throw Object.assign(new Error('denied'), { token: savedSecret })
					}
				}
				save.maskValue(savedSecret, { restore: true })
				const spy = await save(subject)
				expect(a.throws<any>(() => spy.fail()).token).toBe(savedSecret)
				await save.done()

				simulate.maskValue(runSecret, { restore: true })
				const stub = await simulate(subject)
				expect(a.throws<any>(() => stub.fail()).token).toBe(runSecret)
				await simulate.done()
			})
		})

		incubator.sequence('in a callback argument', (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = { onToken: (cb: (token: string) => void) => cb(savedSecret) }
				save.maskValue(savedSecret, { restore: true })
				const spy = await save(subject)
				let received: string | undefined
				spy.onToken((token) => {
					received = token
				})
				expect(received).toBe(savedSecret)
				await save.done()

				simulate.maskValue(runSecret, { restore: true })
				const stub = await simulate(subject)
				stub.onToken((token) => {
					received = token
				})
				expect(received).toBe(runSecret)
				await simulate.done()
			})
		})

		incubator.sequence('in a property read', (specName, { save, simulate }) => {
			test(specName, async () => {
				save.maskValue(savedSecret, { restore: true })
				const spy = await save({ token: savedSecret })
				expect(spy.token).toBe(savedSecret)
				await save.done()

				simulate.maskValue(runSecret, { restore: true })
				const stub = await simulate({ token: runSecret })
				expect(stub.token).toBe(runSecret)
				await simulate.done()
			})
		})

		incubator.sequence('in an instance created with new', (specName, { save, simulate }) => {
			test(specName, async () => {
				class Client {
					token = savedSecret
					getToken() {
						return this.token
					}
				}
				save.maskValue(savedSecret, { restore: true })
				const Spy = await save(Client)
				const client = new Spy()
				expect(client.getToken()).toBe(savedSecret)
				await save.done()

				simulate.maskValue(runSecret, { restore: true })
				const Stub = await simulate(Client)
				expect(new Stub().getToken()).toBe(runSecret)
				await simulate.done()
			})
		})
	})

	describe('keeps the value masked when it is not asked for', () => {
		incubator.sequence('the options object without restore', (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = { token: () => savedSecret }
				save.maskValue(savedSecret, { replaceWith: '[token]' })
				const spy = await save(subject)
				spy.token()
				await save.done()

				simulate.maskValue(runSecret, { replaceWith: '[token]' })
				const stub = await simulate(subject)
				expect(stub.token()).toBe('[token]')
				await simulate.done()
			})
		})

		incubator.sequence('restore: false', (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = { token: () => savedSecret }
				save.maskValue(savedSecret, { restore: false })
				const spy = await save(subject)
				spy.token()
				await save.done()

				simulate.maskValue(runSecret, { restore: false })
				const stub = await simulate(subject)
				expect(stub.token()).toBe('[masked]')
				await simulate.done()
			})
		})
	})

	describe('keeps the value masked and warns when the criterion is ambiguous', () => {
		incubator.sequence(
			'two criteria share the placeholder',
			{ logLevel: logLevels.all },
			(specName, { save, simulate }, reporter) => {
				test(specName, async () => {
					const subject = { token: () => savedSecret }
					save.maskValue(savedSecret, { restore: true })
					save.maskValue('other-secret')
					const spy = await save(subject)
					spy.token()
					await save.done()

					simulate.maskValue(runSecret, { restore: true })
					simulate.maskValue('other-secret')
					const stub = await simulate(subject)
					expect(stub.token()).toBe('[masked]')
					await simulate.done()

					const log = reporter.getLogMessage()
					expect(log).toContain('"[masked]"')
					expect(log).toContain('replaceWith')
					expectNoSecret(log)
				})
			}
		)

		incubator.sequence(
			'a regex criterion shares the placeholder',
			{ logLevel: logLevels.all },
			(specName, { save, simulate }, reporter) => {
				test(specName, async () => {
					const subject = { token: () => savedSecret }
					save.maskValue(savedSecret, { replaceWith: '[token]', restore: true })
					save.maskValue(/other-\d+/, '[token]')
					const spy = await save(subject)
					spy.token()
					await save.done()

					simulate.maskValue(runSecret, { replaceWith: '[token]', restore: true })
					simulate.maskValue(/other-\d+/, '[token]')
					const stub = await simulate(subject)
					expect(stub.token()).toBe('[token]')
					await simulate.done()

					const log = reporter.getLogMessage()
					expect(log).toContain('"[token]"')
					expect(log).toContain('replaceWith')
					expectNoSecret(log)
				})
			}
		)

		incubator.sequence('a regex criterion', { logLevel: logLevels.all }, (specName, { save, simulate }, reporter) => {
			test(specName, async () => {
				const subject = { token: () => savedSecret }
				save.maskValue(/tok-[a-z]+-\w+/, { restore: true })
				const spy = await save(subject)
				spy.token()
				await save.done()

				simulate.maskValue(/tok-[a-z]+-\w+/, { restore: true })
				const stub = await simulate(subject)
				expect(stub.token()).toBe('[masked]')
				await simulate.done()

				const log = reporter.getLogMessage()
				expect(log).toContain('regex')
				expectNoSecret(log)
			})
		})

		incubator.sequence(
			'criteria with distinct placeholders are both restored',
			{ logLevel: logLevels.all },
			(specName, { save, simulate }, reporter) => {
				test(specName, async () => {
					const subject = { both: () => `${savedSecret}/saved-key` }
					save.maskValue(savedSecret, { replaceWith: '[token]', restore: true })
					save.maskValue('saved-key', { replaceWith: '[key]', restore: true })
					const spy = await save(subject)
					spy.both()
					await save.done()

					simulate.maskValue(runSecret, { replaceWith: '[token]', restore: true })
					simulate.maskValue('run-key', { replaceWith: '[key]', restore: true })
					const stub = await simulate(subject)
					expect(stub.both()).toBe(`${runSecret}/run-key`)
					await simulate.done()
					expect(reporter.getLogMessage()).not.toContain('replaceWith')
				})
			}
		)
	})

	describe('never leaks the secret', () => {
		incubator.sequence(
			'into the record or the logs',
			{ logLevel: logLevels.all },
			(specName, { save, simulate }, reporter) => {
				test(specName, async () => {
					const subject = {
						token: () => savedSecret,
						header: (token: string) => `Bearer ${token}`
					}
					save.maskValue(savedSecret, { restore: true })
					const spy = await save(subject)
					spy.header(spy.token())
					const record = await save.done()
					expectNoSecret(json.stringify(record))

					simulate.maskValue(runSecret, { restore: true })
					const stub = await simulate(subject)
					// the restored token is passed back into a spec'd call
					expect(stub.header(stub.token())).toBe(`Bearer ${runSecret}`)
					await simulate.done()
					expectNoSecret(reporter.getLogMessage())
				})
			}
		)

		incubator.sequence(
			'into ActionMismatch',
			{ logLevel: logLevels.all, argumentMatching: 'strings' },
			(specName, { save, simulate }, reporter) => {
				test(specName, async () => {
					const subject = {
						token: () => savedSecret,
						send: (header: string) => header.length
					}
					save.maskValue(savedSecret, { restore: true })
					const spy = await save(subject)
					spy.token()
					spy.send(`Bearer ${savedSecret}`)
					await save.done()

					simulate.maskValue(runSecret, { restore: true })
					const stub = await simulate(subject)
					const token = stub.token()
					expect(token).toBe(runSecret)
					const err = a.throws(() => stub.send(`Basic ${token}`), ActionMismatch)
					expect(err.argument?.strings).toEqual({ expected: 'Bearer [masked]', received: 'Basic [masked]' })
					expectNoSecret(err.message)
					expectNoSecret(json.stringify(err.argument))
					expectNoSecret(reporter.getLogMessage())
				})
			}
		)
	})

	describe('has no effect outside simulation', () => {
		incubator.save('save returns the real value', (specName, spec) => {
			test(specName, async () => {
				spec.maskValue(savedSecret, { restore: true })
				const spy = await spec({ token: () => savedSecret })
				expect(spy.token()).toBe(savedSecret)
				await spec.done()
			})
		})

		test('the record is byte-identical with and without restore', async () => {
			vi.spyOn(Date, 'now').mockReturnValue(Date.now())
			onTestFinished(() => {
				vi.restoreAllMocks()
			})
			const records: string[] = []
			for (const restore of [undefined, false, true]) {
				records.push(
					await saveRecord(`byte identical ${String(restore)}`, async (save) => {
						if (restore === undefined) save.maskValue(savedSecret, '[token]')
						else save.maskValue(savedSecret, { replaceWith: '[token]', restore })
						const spy = await save({ token: () => savedSecret, n: 1 })
						spy.token()
						expect(spy.n).toBe(1)
					})
				)
			}
			expect(records[0]).toContain('[token]')
			expect(records[1]).toBe(records[0])
			expect(records[2]).toBe(records[0])
		})
	})
})

describe('zucchini', () => {
	const { scenario, defineStep } = createZucchini(createTestContext())
	afterAll(() => scenario.cleanup())

	test('a step restores a masked secret', async () => {
		let secret = savedSecret
		defineStep('read the restored token', async ({ spec, maskValue }) => {
			maskValue(secret, { replaceWith: '[token]', restore: true })
			const s = await spec({ token: () => secret })
			return s.token()
		})

		const save = scenario.save('zucchini restore')
		expect(await save.run('read the restored token')).toBe(savedSecret)
		await save.done()

		secret = runSecret
		const sim = scenario.simulate('zucchini restore')
		expect(await sim.run('read the restored token')).toBe(runSecret)
		await sim.done()
	})
})

/**
 * Saves a record in its own spec and returns it as it is written to the spec file.
 */
async function saveRecord(specName: string, handler: (save: Spec) => Promise<void>) {
	let result: Promise<SpecRecord> | undefined
	incubator.sequence(specName, (_, { save }) => {
		result = handler(save).then(() => save.done())
	})
	return json.stringify(await result!)
}
