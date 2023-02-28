import { a } from 'assertron'
import { filename } from 'dirname-filename-esm'
import { relative } from 'node:path'
import { logLevels } from 'standard-log'
import { record } from 'type-plus'
import { createMockto, SpecNotFound } from '../index.js'
import { createTestContext } from '../testing/index.js'
import { indirectMockto } from './mockto.test-setup.js'

const { context, stackFrame } = createTestContext()
const mockto = createMockto({ context, stackFrame })

afterAll(() => mockto.cleanup())

describe(`mockto.live()`, () => {
	test('live with no options', () => {
		const specNameInput = 'live with no options'
		return new Promise<void>(a => {
			mockto.live(specNameInput, async (specName, spec) => {
				expect(specName).toEqual(specNameInput)
				const s = await spec((x: number) => x + 1)
				expect(s(1)).toBe(2)
				await spec.done()
				a()
			})
		})
	})

	test('live with options', () => {
		const specNameInput = 'live with options'
		return new Promise<void>(a => {
			mockto.live(specNameInput, { timeout: 2000 }, (specName, spec) => {
				expect(specName).toEqual(specNameInput)
				spec((x: number) => x + 1).then(s => {
					expect(s(1)).toBe(2)
					a()
				})
			})
		})
	})

	// TODO: live mode should proxy spec subject,
	// to capture interactions into logs.
	it.skip('can log interactions', () => {
		const mockto = createMockto(createTestContext())
		return new Promise<void>(a => {
			mockto.live('live has enableLog method', { logLevel: logLevels.all }, async (_, spec, reporter) => {
				const s = await spec(() => {})
				s()
				expect(reporter.logs.length > 0).toBe(true)
				a()
			})
		})
	})
})

describe(`mockto.save()`, () => {
	test('save with no options', async () => {
		const specNameInput = 'save with no options'
		await new Promise<void>(a => {
			mockto.save(specNameInput, (specName, spec) => {
				expect(specName).toEqual(specNameInput)
				spec((x: number) => x + 1).then(async s => {
					expect(s(1)).toBe(2)
					await spec.done()
					a()
				})
			})
		})

		const { io } = await context.get()
		const record = await io.readSpec(specNameInput, '')
		expect(record).not.toBeUndefined()
	})

	test('save with options', async () => {
		const specNameInput = 'save with options'
		await new Promise<void>(a => {
			mockto.save(specNameInput, { timeout: 100 }, (specName, spec) => {
				expect(specName).toEqual(specNameInput)
				spec((x: number) => x + 1).then(async s => {
					expect(s(1)).toBe(2)
					await spec.done()
					a()
				})
			})
		})

		const { io } = await context.get()
		const record = await io.readSpec(specNameInput, '')
		expect(record).not.toBeUndefined()
	})
})

describe(`mockto.simulate()`, () => {
	test('simulate with no options', async () => {
		const specNameInput = 'simulate with no options'
		await new Promise<void>(r => {
			mockto.simulate(specNameInput, (specName, spec) => {
				expect(specName).toEqual(specNameInput)
				a.throws(() => spec((x: number) => x + 1), SpecNotFound)
				r()
			})
		})
	})

	test('simulate with options', async () => {
		const specNameInput = 'simulate with options'
		await new Promise<void>(r => {
			mockto.simulate(specNameInput, { timeout: 100 }, (specName, spec) => {
				expect(specName).toEqual(specNameInput)
				a.throws(() => spec((x: number) => x + 1), SpecNotFound)
				r()
			})
		})
	})
})

describe(`mockto()`, () => {
	test.only('auto with no options', async () => {
		const specNameInput = 'auto with no options'
		await new Promise<void>(a => {
			mockto(specNameInput, (specName, spec) => {
				expect(specName).toEqual(specNameInput)
				spec((x: number) => x + 1).then(async s => {
					expect(s(1)).toBe(2)
					await spec.done()
					a()
				})
			})
		})

		const { io } = await context.get()
		const record = await io.readSpec(specNameInput, '')
		expect(record).not.toBeUndefined()

		await new Promise<void>(a => {
			mockto(specNameInput, (_, spec) => {
				spec(() => {
					throw new Error('should not reach')
				}).then(async (s: any) => {
					expect(s(1)).toBe(2)
					await spec.done()
					a()
				})
			})
		})
	})

	test('auto with options', async () => {
		const specNameInput = 'auto with options'
		await new Promise<void>(a => {
			mockto(specNameInput, { timeout: 100 }, (specName, spec) => {
				expect(specName).toEqual(specNameInput)
				spec((x: number) => x + 1).then(async s => {
					expect(s(1)).toBe(2)
					await spec.done()
					a()
				})
			})
		})

		const { io } = await context.get()
		const record = await io.readSpec(specNameInput, '')
		expect(record).not.toBeUndefined()

		await new Promise<void>(a => {
			mockto(specNameInput, { timeout: 100 }, (_, spec) => {
				spec(() => {
					throw new Error('should not reach')
				}).then(async (s: any) => {
					expect(s(1)).toBe(2)
					await spec.done()
					a()
				})
			})
		})
	})
})

describe('mockto.mock()', () => {
	mockto.mock('requires to specify mock', (specName, spec) => {
		it(specName, async () => {
			const s = await spec((v: string) => v, { mock: () => 'stubbed' })
			const r = s('value')
			expect(r).toBe('stubbed')
			await spec.done()
		})
	})

	mockto.mock('spec.mode returns mock', (specName, spec) => {
		it(specName, async () => {
			await spec((v: string) => v, { mock: () => 'stubbed' })
			expect(spec.mode).toEqual('mock')
			await spec.done()
		})
	})

	mockto('direct accepts mock but ignore it', (specName, spec) => {
		it(specName, async () => {
			const s = await spec((v: string) => v, { mock: () => 'stubbed' })
			const r = s('value')
			expect(r).toBe('value')
			await spec.done()
		})
	})
	mockto.live('live accepts mock but ignore it', (specName, spec) => {
		it(specName, async () => {
			const s = await spec((v: string) => v, { mock: () => 'stubbed' })
			const r = s('value')
			expect(r).toBe('value')
			await spec.done()
		})
	})
	mockto.save('save accepts mock but ignore it', (specName, spec) => {
		it(specName, async () => {
			const s = await spec((v: string) => v, { mock: () => 'stubbed' })
			const r = s('value')
			expect(r).toBe('value')
			await spec.done()
		})
	})
})

test.todo('spec name supports other characters (standard-log restricts them). Need to transform those chars')

mockto(
	'can enable log after spec subject is created',
	{ logLevel: logLevels.all },
	(specName, spec, reporter) => {
		test(specName, async () => {
			const s = await spec(() => 1)
			expect(s()).toBe(1)

			await spec.done()

			expect(reporter.logs.length).toBeGreaterThan(0)
			const ids = Object.keys(
				reporter.logs.reduce((p, log) => {
					p[log.id] = true
					return p
				}, record())
			)
			expect(ids.length).toEqual(1)
			expect(ids[0]).toMatch(/mocktomata:can enable/)
		})
	}
)

describe('config', () => {
	test('override to live mode', async () => {
		const { context, stackFrame } = createTestContext({ config: { overrideMode: 'live' } })
		const mockto = createMockto({ context, stackFrame })

		await new Promise<void>(a => {
			mockto('force live', async (_, spec) => {
				;(await spec(() => {}))()
				await spec.done()
				a()
			})
		})
		const { io } = await context.get()
		await a.throws(io.readSpec('force live', ''), SpecNotFound)
	})

	test('overrideMode has no effect on save and simulate', async () => {
		const { context, stackFrame } = createTestContext({ config: { overrideMode: 'live' } })
		const mockto = createMockto({ context, stackFrame })

		await new Promise<void>(a => {
			mockto.save('force live', async (_, spec) => {
				;(await spec(() => {}))()
				await spec.done()
				a()
			})
		})
		await new Promise<void>(a => {
			mockto.simulate('force live', async (_, spec) => {
				;(await spec(() => {}))()
				await spec.done()
				a()
			})
		})
	})

	test('overrideMode for specific spec name', async () => {
		const { context, stackFrame } = createTestContext({
			config: {
				overrideMode: 'live',
				specNameFilter: 'to-live'
			}
		})
		const mockto = createMockto({ context, stackFrame })

		await new Promise<void>(a => {
			mockto('not affected', async (_, spec) => {
				;(await spec(() => {}))()
				await spec.done()
				a()
			})
		})
		await new Promise<void>(a => {
			mockto('a to-live spec', async (_, spec) => {
				;(await spec(() => {}))()
				await spec.done()
				a()
			})
		})
		const { io } = await context.get()
		await io.readSpec('not affected', '')
		await a.throws(io.readSpec('a to-live spec', ''), SpecNotFound)
	})
})

describe('maskValue()', () => {
	mockto.live('explicit live mode returns sensitive info', (specName, spec) => {
		test(specName, async () => {
			spec.maskValue('secret')
			const s = await spec((v: string) => v)
			const actual = s('secret')
			expect(actual).toBe('secret')
		})
	})
})

// The indirect usage is not really like this,
// but for test this is sufficient
indirectMockto(
	mockto,
	'indirect usage',
	{
		logLevel: Infinity,
		specRelativePath: relative(process.cwd(), filename(import.meta))
	},
	async (_, spec, reporter) => {
		it('can specify specRelativePath for indirect usage', async () => {
			await spec.done()
			// need to skip `ts/` and `.ts` from match.
			// jest run from `ts` or `esm` depends on it is `test:watch` vs `test` or `coverage`
			expect(reporter.getLogMessage()).toMatch('/mockto/mockto.spec')
		})
	}
)
