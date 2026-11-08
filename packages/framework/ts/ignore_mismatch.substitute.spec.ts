import { a } from 'assertron'
import fc from 'fast-check'
import { createIncubator } from './incubator/create_incubator.js'
import { createMockto, createZucchini } from './index.js'
import { json } from './json.js'
import { ActionMismatch } from './spec/errors.js'
import type { Spec } from './spec/types.js'
import type { SpecRecord } from './spec_record/types.js'
import { logLevels } from './standard_log.types.js'
import { createTestContext } from './testing/index.js'

// es2020 so that bigint is supported.
const incubator = createIncubator(createTestContext({ config: { ecmaVersion: 'es2020' } }))
afterAll(() => incubator.cleanup())

const substitute = { replay: 'substitute' } as const

// A bigint is recorded as a JSON number, and only one beyond `Number.MAX_SAFE_INTEGER` is read back as a bigint.
const values = [
	{ type: 'string', recorded: 'id-recorded', current: 'id-current' },
	{ type: 'number', recorded: 1001, current: 2002 },
	{ type: 'boolean', recorded: true, current: false },
	{ type: 'bigint', recorded: 9007199254740993n, current: 9007199254740995n }
] as const

describe('ignoreMismatch(value, { replay: "substitute" })', () => {
	describe('each value type', () => {
		for (const { type, recorded, current } of values) {
			incubator.sequence(`${type}: the value of this run is returned`, (specName, { save, simulate }) => {
				test(specName, async () => {
					const echo = (x: unknown) => x
					save.ignoreMismatch(recorded)
					const spy = await save(echo)
					expect(spy(recorded)).toBe(recorded)
					await save.done()

					simulate.ignoreMismatch(current, substitute)
					const stub = await simulate(echo)
					expect(stub(current)).toBe(current)
					await simulate.done()
				})
			})

			incubator.sequence(`${type}: by default the recorded value is returned`, (specName, { save, simulate }) => {
				test(specName, async () => {
					const echo = (x: unknown) => x
					save.ignoreMismatch(recorded)
					const spy = await save(echo)
					spy(recorded)
					await save.done()

					simulate.ignoreMismatch(current)
					const stub = await simulate(echo)
					expect(stub(current)).toBe(recorded)
					await simulate.done()
				})
			})

			incubator.sequence(`${type}: replay 'recorded' returns the recorded value`, (specName, { save, simulate }) => {
				test(specName, async () => {
					const echo = (x: unknown) => x
					save.ignoreMismatch(recorded)
					const spy = await save(echo)
					spy(recorded)
					await save.done()

					simulate.ignoreMismatch(current, { replay: 'recorded' })
					const stub = await simulate(echo)
					expect(stub(current)).toBe(recorded)
					await simulate.done()
				})
			})
		}
	})

	describe('each place a value comes back', () => {
		const R = 'id-recorded'
		const N = 'id-current'

		incubator.sequence('a return value', (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = { create: (id: string) => id }
				save.ignoreMismatch(R)
				const spy = await save(subject)
				expect(spy.create(R)).toBe(R)
				await save.done()

				simulate.ignoreMismatch(N, substitute)
				const stub = await simulate(subject)
				expect(stub.create(N)).toBe(N)
				await simulate.done()
			})
		})

		incubator.sequence('a value nested in a returned object', (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = (id: string) => ({ user: { id, name: 'a' } })
				save.ignoreMismatch(R)
				const spy = await save(subject)
				const saved = spy(R)
				expect(saved.user.id).toBe(R)
				expect(saved.user.name).toBe('a')
				await save.done()

				simulate.ignoreMismatch(N, substitute)
				const stub = await simulate(subject)
				const actual = stub(N)
				expect(actual.user.id).toBe(N)
				expect(actual.user.name).toBe('a')
				await simulate.done()
			})
		})

		incubator.sequence('a value nested in a returned array', (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = (id: string) => ['a', id]
				save.ignoreMismatch(R)
				const spy = await save(subject)
				expect(spy(R)[1]).toBe(R)
				await save.done()

				simulate.ignoreMismatch(N, substitute)
				const stub = await simulate(subject)
				expect(stub(N)[1]).toBe(N)
				await simulate.done()
			})
		})

		incubator.sequence('a resolved promise', (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = (id: string) => Promise.resolve(id)
				save.ignoreMismatch(R)
				const spy = await save(subject)
				expect(await spy(R)).toBe(R)
				await save.done()

				simulate.ignoreMismatch(N, substitute)
				const stub = await simulate(subject)
				expect(await stub(N)).toBe(N)
				await simulate.done()
			})
		})

		incubator.sequence("a thrown error's property", (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = (id: string) => {
					throw Object.assign(new Error('not found'), { id })
				}
				save.ignoreMismatch(R)
				const spy = await save(subject)
				expect(a.throws<any>(() => spy(R)).id).toBe(R)
				await save.done()

				simulate.ignoreMismatch(N, substitute)
				const stub = await simulate(subject)
				expect(a.throws<any>(() => stub(N)).id).toBe(N)
				await simulate.done()
			})
		})

		incubator.sequence('a thrown value', (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = (id: string) => {
					throw id
				}
				save.ignoreMismatch(R)
				const spy = await save(subject)
				expect(a.throws<any>(() => spy(R))).toBe(R)
				await save.done()

				simulate.ignoreMismatch(N, substitute)
				const stub = await simulate(subject)
				expect(a.throws<any>(() => stub(N))).toBe(N)
				await simulate.done()
			})
		})

		incubator.sequence('a callback argument', (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = (id: string, cb: (id: string) => void) => cb(id)
				save.ignoreMismatch(R)
				const spy = await save(subject)
				let received: string | undefined
				spy(R, (id) => {
					received = id
				})
				expect(received).toBe(R)
				await save.done()

				simulate.ignoreMismatch(N, substitute)
				const stub = await simulate(subject)
				stub(N, (id) => {
					received = id
				})
				expect(received).toBe(N)
				await simulate.done()
			})
		})

		incubator.sequence('a property read', (specName, { save, simulate }) => {
			test(specName, async () => {
				save.ignoreMismatch(R)
				const spy = await save({ id: 'none' })
				spy.id = R
				expect(spy.id).toBe(R)
				await save.done()

				simulate.ignoreMismatch(N, substitute)
				const stub = await simulate({ id: 'none' })
				stub.id = N
				expect(stub.id).toBe(N)
				await simulate.done()
			})
		})

		incubator.sequence('an instance created with new', (specName, { save, simulate }) => {
			test(specName, async () => {
				class User {
					constructor(public id: string) {}
					getId() {
						return this.id
					}
				}
				save.ignoreMismatch(R)
				const Spy = await save(User)
				const saved = new Spy(R)
				expect(saved.getId()).toBe(R)
				expect(saved.id).toBe(R)
				await save.done()

				simulate.ignoreMismatch(N, substitute)
				const Stub = await simulate(User)
				const actual = new Stub(N)
				expect(actual.getId()).toBe(N)
				expect(actual.id).toBe(N)
				await simulate.done()
			})
		})
	})

	describe('ordering', () => {
		incubator.sequence('a value that comes back before the pairing is not replaced', (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = { slot: 0, current: () => 1001 }
				save.ignoreMismatch(1001)
				const spy = await save(subject)
				expect(spy.current()).toBe(1001)
				spy.slot = 1001
				expect(spy.current()).toBe(1001)
				await save.done()

				simulate.ignoreMismatch(2002, substitute)
				const stub = await simulate(subject)
				expect(stub.current()).toBe(1001)
				stub.slot = 2002
				expect(stub.current()).toBe(2002)
				await simulate.done()
			})
		})

		incubator.sequence('a value that is never paired is not replaced', (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = { current: () => 1001 }
				save.ignoreMismatch(1001)
				const spy = await save(subject)
				spy.current()
				await save.done()

				simulate.ignoreMismatch(2002, substitute)
				const stub = await simulate(subject)
				expect(stub.current()).toBe(1001)
				await simulate.done()
			})
		})

		incubator.sequence(
			'a value of this run that is not passed to ignoreMismatch() is not paired',
			(specName, { save, simulate }) => {
				test(specName, async () => {
					const echo = (x: number) => x
					save.ignoreMismatch(1001)
					const spy = await save(echo)
					spy(1001)
					await save.done()

					simulate.ignoreMismatch(3003, substitute)
					const stub = await simulate(echo)
					expect(stub(2002)).toBe(1001)
					await simulate.done()
				})
			}
		)

		incubator.sequence('a value of another type is not paired', (specName, { save, simulate }) => {
			test(specName, async () => {
				const echo = (x: unknown) => x
				save.ignoreMismatch(1001)
				const spy = await save(echo)
				spy(1001)
				await save.done()

				simulate.ignoreMismatch('1001', substitute)
				const stub = await simulate(echo)
				expect(stub('1001')).toBe(1001)
				await simulate.done()
			})
		})
	})

	describe('overlaps', () => {
		incubator.sequence(
			'two ignored values with the same recorded value and the same value of this run',
			(specName, { save, simulate }) => {
				test(specName, async () => {
					const subject = { a: 0, b: 0, read: () => 1001 }
					save.ignoreMismatch(1001)
					save.ignoreMismatch(1001)
					const spy = await save(subject)
					spy.a = 1001
					spy.b = 1001
					spy.read()
					await save.done()

					simulate.ignoreMismatch(2002, substitute)
					simulate.ignoreMismatch(2002, substitute)
					const stub = await simulate(subject)
					stub.a = 2002
					stub.b = 2002
					expect(stub.read()).toBe(2002)
					await simulate.done()
				})
			}
		)

		incubator.sequence(
			'two ignored values with the same recorded value and different values of this run stop the substitution and warn',
			{ logLevel: logLevels.all },
			(specName, { save, simulate }, reporter) => {
				test(specName, async () => {
					const subject = { a: 0, b: 0, read: () => 1001 }
					save.ignoreMismatch(1001)
					const spy = await save(subject)
					spy.a = 1001
					spy.read()
					spy.b = 1001
					spy.read()
					await save.done()

					simulate.ignoreMismatch(2002, substitute)
					simulate.ignoreMismatch(3003, substitute)
					const stub = await simulate(subject)
					stub.a = 2002
					expect(stub.read()).toBe(2002)
					stub.b = 3003
					expect(stub.read()).toBe(1001)
					await simulate.done()
					const log = reporter.getLogMessage()
					expect(log).toContain('ignoreMismatch(): a recorded value is taken by two different values')
					expect(log).not.toMatch(/WARN.*2002|WARN.*3003/)
				})
			}
		)

		incubator.sequence(
			'the recorded value in unrelated output is replaced too, which is the risk of a common value',
			(specName, { save, simulate }) => {
				test(specName, async () => {
					const subject = { create: (id: number) => id, count: () => 7 }
					save.ignoreMismatch(7)
					const spy = await save(subject)
					spy.create(7)
					expect(spy.count()).toBe(7)
					await save.done()

					simulate.ignoreMismatch(8, substitute)
					const stub = await simulate(subject)
					expect(stub.create(8)).toBe(8)
					// `count()` is unrelated, but returns the same value
					expect(stub.count()).toBe(8)
					await simulate.done()
				})
			}
		)

		incubator.sequence('a string is not replaced inside a longer string', (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = { create: (id: string) => id, wrap: () => 'xabcx' }
				save.ignoreMismatch('abc')
				const spy = await save(subject)
				spy.create('abc')
				expect(spy.wrap()).toBe('xabcx')
				await save.done()

				simulate.ignoreMismatch('def', substitute)
				const stub = await simulate(subject)
				expect(stub.create('def')).toBe('def')
				expect(stub.wrap()).toBe('xabcx')
				await simulate.done()
			})
		})

		incubator.sequence('a value derived from the input returns the recorded result', (specName, { save, simulate }) => {
			test(specName, async () => {
				const subject = (x: number) => x + 1
				save.ignoreMismatch(1001)
				const spy = await save(subject)
				expect(spy(1001)).toBe(1002)
				await save.done()

				simulate.ignoreMismatch(2002, substitute)
				const stub = await simulate(subject)
				expect(stub(2002)).toBe(1002)
				await simulate.done()
			})
		})

		const savedToken = 'tok-saved-7f3a'
		const runToken = 'tok-run-c91e'

		incubator.sequence(
			'ignoreMismatch() and maskValue() on the same value',
			{ logLevel: logLevels.all },
			(specName, { save, simulate }, reporter) => {
				test(specName, async () => {
					const echo = (token: string) => token
					save.ignoreMismatch(savedToken)
					save.maskValue(savedToken)
					const spy = await save(echo)
					expect(spy(savedToken)).toBe(savedToken)
					const record = await save.done()
					expect(json.stringify(record)).not.toContain(savedToken)

					simulate.ignoreMismatch(runToken, substitute)
					simulate.maskValue(runToken)
					const stub = await simulate(echo)
					expect(stub(runToken)).toBe(runToken)
					await simulate.done()
					const log = reporter.getLogMessage()
					expect(log).not.toContain(savedToken)
					expect(log).not.toContain(runToken)
				})
			}
		)

		incubator.sequence(
			'ignoreMismatch() and maskValue() with restore on the same value',
			(specName, { save, simulate }) => {
				test(specName, async () => {
					const subject = { echo: (token: string) => token, header: () => `Bearer ${savedToken}` }
					save.ignoreMismatch(savedToken)
					save.maskValue(savedToken, { restore: true })
					const spy = await save(subject)
					spy.echo(savedToken)
					spy.header()
					await save.done()

					simulate.ignoreMismatch(runToken, substitute)
					simulate.maskValue(runToken, { restore: true })
					const stub = await simulate(subject)
					expect(stub.echo(runToken)).toBe(runToken)
					expect(stub.header()).toBe(`Bearer ${runToken}`)
					await simulate.done()
				})
			}
		)
	})

	describe('interplay with argumentMatching', () => {
		for (const argumentMatching of ['behavior', 'strings'] as const) {
			incubator.sequence(
				`${argumentMatching}: the value of this run flows into a later call`,
				{ argumentMatching },
				(specName, { save, simulate }) => {
					test(specName, async () => {
						const subject = { create: (id: string) => id, get: (id: string) => id.length }
						save.ignoreMismatch('id-1')
						const spy = await save(subject)
						const saved = spy.create('id-1')
						expect(spy.get(saved)).toBe(4)
						await save.done()

						simulate.ignoreMismatch('id-22', substitute)
						const stub = await simulate(subject)
						const id = stub.create('id-22')
						expect(id).toBe('id-22')
						// replays the recorded result
						expect(stub.get(id)).toBe(4)
						await simulate.done()
					})
				}
			)
		}

		incubator.sequence(
			'strings: another string in the later call is still compared',
			{ argumentMatching: 'strings' },
			(specName, { save, simulate }) => {
				test(specName, async () => {
					const subject = { create: (id: string) => id, get: (id: string, field: string) => id + field }
					save.ignoreMismatch('id-1')
					const spy = await save(subject)
					const saved = spy.create('id-1')
					spy.get(saved, 'name')
					await save.done()

					simulate.ignoreMismatch('id-22', substitute)
					const stub = await simulate(subject)
					const id = stub.create('id-22')
					const err = a.throws(() => stub.get(id, 'email'), ActionMismatch)
					expect(err.argument).toEqual({
						argumentMatching: 'strings',
						index: 1,
						strings: { expected: 'name', received: 'email' }
					})
				})
			}
		)

		incubator.sequence(
			'behavior: a changed number in the later call is still compared',
			(specName, { save, simulate }) => {
				test(specName, async () => {
					const subject = { create: (id: string) => id, get: (id: string, n: number) => id.length + n }
					save.ignoreMismatch('id-1')
					const spy = await save(subject)
					const saved = spy.create('id-1')
					spy.get(saved, 1)
					await save.done()

					simulate.ignoreMismatch('id-22', substitute)
					const stub = await simulate(subject)
					const id = stub.create('id-22')
					const err = a.throws(() => stub.get(id, 2), ActionMismatch)
					expect(err.argument).toEqual({ argumentMatching: 'behavior', index: 1 })
				})
			}
		)

		incubator.sequence('the value of this run is used again as an argument', (specName, { save, simulate }) => {
			test(specName, async () => {
				const echo = (x: number) => x
				save.ignoreMismatch(1001)
				const spy = await save(echo)
				spy(1001)
				spy(1001)
				await save.done()

				simulate.ignoreMismatch(2002, substitute)
				const stub = await simulate(echo)
				expect(stub(2002)).toBe(2002)
				expect(stub(2002)).toBe(2002)
				await simulate.done()
			})
		})
	})

	describe('after the pairing, another value', () => {
		incubator.sequence('in a later call still throws', (specName, { save, simulate }) => {
			test(specName, async () => {
				const echo = (x: number) => x
				save.ignoreMismatch(1001)
				const spy = await save(echo)
				spy(1001)
				spy(1001)
				await save.done()

				simulate.ignoreMismatch(2002, substitute)
				const stub = await simulate(echo)
				expect(stub(2002)).toBe(2002)
				a.throws(() => stub(3003), ActionMismatch)
			})
		})
	})

	describe('no effect where it should not have one', () => {
		incubator.save('save returns the real values', (specName, spec) => {
			test(specName, async () => {
				spec.ignoreMismatch(1001, substitute)
				const spy = await spec((x: number) => ({ x, y: 7 }))
				const actual = spy(1001)
				expect(actual.x).toBe(1001)
				expect(actual.y).toBe(7)
				await spec.done()
			})
		})

		test('live mode returns the real values', async () => {
			const { context, stackFrame } = createTestContext()
			const mockto = createMockto({ context, stackFrame })
			await new Promise<void>((resolve, reject) => {
				mockto.live('substitute in live mode', (_, spec) => {
					;(async () => {
						spec.ignoreMismatch(1001, substitute)
						const spy = await spec((x: number) => x + 1)
						expect(spy(1001)).toBe(1002)
						expect(spy(5)).toBe(6)
						await spec.done()
					})().then(resolve, reject)
				})
			})
		})

		test('the record is byte-identical with and without the option', async () => {
			vi.spyOn(Date, 'now').mockReturnValue(Date.now())
			onTestFinished(() => {
				vi.restoreAllMocks()
			})
			const records: string[] = []
			for (const options of [undefined, { replay: 'recorded' as const }, substitute]) {
				records.push(
					await saveRecord(`byte identical ${options?.replay}`, async (save) => {
						save.ignoreMismatch(1001, options)
						save.ignoreMismatch('id-1', options)
						const spy = await save({ create: (n: number, id: string) => ({ n, id }), slot: '' })
						const saved = spy.create(1001, 'id-1')
						expect(saved.n).toBe(1001)
						spy.slot = 'id-1'
					})
				)
			}
			expect(records[0]).toContain('"inert":true')
			expect(records[1]).toBe(records[0])
			expect(records[2]).toBe(records[0])
		})
	})
})

describe('zucchini', () => {
	const { scenario, defineStep } = createZucchini(createTestContext())
	afterAll(() => scenario.cleanup())

	test('a step substitutes the value of this run', async () => {
		let id = 'id-recorded'
		defineStep('create the user', async ({ spec, ignoreMismatch }) => {
			ignoreMismatch(id, substitute)
			const s = await spec({ create: (id: string) => ({ id }) })
			return s.create(id).id
		})

		const save = scenario.save('zucchini substitute')
		expect(await save.run('create the user')).toBe('id-recorded')
		await save.done()

		id = 'id-current'
		const sim = scenario.simulate('zucchini substitute')
		expect(await sim.run('create the user')).toBe('id-current')
		await sim.done()
	})

	test('scenario.ignoreMismatch() substitutes too', async () => {
		const subject = { create: (id: string) => id }
		const save = scenario.save('zucchini scenario substitute')
		save.ignoreMismatch('id-recorded', substitute)
		const spy = await save.spec(subject)
		expect(spy.create('id-recorded')).toBe('id-recorded')
		await save.done()

		const sim = scenario.simulate('zucchini scenario substitute')
		sim.ignoreMismatch('id-current', substitute)
		const stub = await sim.spec(subject)
		expect(stub.create('id-current')).toBe('id-current')
		await sim.done()
	})
})

describe('property: only exact recorded values are replaced, and only after the pairing', () => {
	// Values that survive the record as they are:
	// no `-0` (it is saved as `0`), and only bigints that are read back as bigints.
	const primitive = fc.oneof(fc.integer(), fc.string(), fc.boolean(), fc.bigInt({ min: 2n ** 60n, max: 2n ** 64n }))
	const scenario = primitive
		.chain((recorded) =>
			fc.record({
				recorded: fc.constant(recorded),
				current: sameTypeOtherThan(recorded),
				// Outputs include the recorded value, values of other types,
				// and for a string, longer strings that contain it.
				outputs: fc.array(
					fc.oneof(
						fc.constant(recorded),
						primitive,
						typeof recorded === 'string' ? fc.constant(`x${recorded}x`) : primitive
					),
					{ maxLength: 8 }
				),
				pairAt: fc.nat()
			})
		)
		.map((s) => ({ ...s, pairAt: s.pairAt % (s.outputs.length + 1) }))

	let runId = 0
	test('holds for random records', async () => {
		await fc.assert(
			fc.asyncProperty(scenario, async ({ recorded, current, outputs, pairAt }) => {
				const specName = `property ${runId++}`
				let save!: Spec
				let simulate!: Spec
				incubator.sequence(specName, (_, specs) => {
					save = specs.save
					simulate = specs.simulate
				})

				let index = 0
				const subject = { slot: undefined as unknown, next: () => outputs[index++] }

				save.ignoreMismatch(recorded)
				const spy = await save(subject)
				const saved: unknown[] = []
				for (let i = 0; i <= outputs.length; i++) {
					if (i === pairAt) spy.slot = recorded
					if (i < outputs.length) saved.push(spy.next())
				}
				await save.done()
				expect(saved).toEqual(outputs)

				simulate.ignoreMismatch(current, substitute)
				const stub = await simulate(subject)
				for (let i = 0; i <= outputs.length; i++) {
					if (i === pairAt) stub.slot = current
					if (i < outputs.length) {
						const actual = stub.next()
						const expected = i >= pairAt && outputs[i] === recorded ? current : outputs[i]
						expect(actual).toBe(expected)
					}
				}
				await simulate.done()
			}),
			{ numRuns: 100 }
		)
	})
})

function sameTypeOtherThan(value: unknown): fc.Arbitrary<unknown> {
	switch (typeof value) {
		case 'number':
			return fc.integer().filter((v) => v !== value)
		case 'string':
			return fc.string().filter((v) => v !== value)
		case 'boolean':
			return fc.constant(!value)
		default:
			return fc.bigInt({ min: 2n ** 60n, max: 2n ** 64n }).filter((v) => v !== value)
	}
}

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
