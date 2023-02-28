import { createMockto, newMemoryIO, type Mockto, type Spec } from '@mocktomata/framework'
import {
	MOCKTOMATA_FILE_PATH_FILTER,
	MOCKTOMATA_LOG_LEVEL,
	MOCKTOMATA_MODE,
	MOCKTOMATA_SPEC_NAME_FILTER
} from '@mocktomata/nodejs'
import { a } from 'assertron'
import { logLevels, MemoryLogReporter } from 'standard-log'
import { CannotConfigAfterUsed, config, mockto } from '../index.js'
import { createContext } from './context.js'

beforeEach(() => {
	delete process.env[MOCKTOMATA_MODE]
	delete process.env[MOCKTOMATA_LOG_LEVEL]
	delete process.env[MOCKTOMATA_FILE_PATH_FILTER]
	delete process.env[MOCKTOMATA_SPEC_NAME_FILTER]
})

afterEach(() => {
	delete process.env[MOCKTOMATA_MODE]
	delete process.env[MOCKTOMATA_LOG_LEVEL]
	delete process.env[MOCKTOMATA_FILE_PATH_FILTER]
	delete process.env[MOCKTOMATA_SPEC_NAME_FILTER]
})

mockto('config() can only be called before using mockto', (specName, spec) => {
	test(specName, async () => {
		await spec({})
		a.throws(() => config({}), CannotConfigAfterUsed)
	})
})

describe('config with config()', () => {
	let mockto: Mockto
	afterEach(() => mockto?.cleanup())

	test('override to live mode', async () => {
		const { config, context, stackFrame } = createContext({ io: newMemoryIO() })
		mockto = createMockto({ context, stackFrame })
		config({ overrideMode: 'live' })
		const spec = await new Promise<Spec>(a => mockto('override to live mode', (_, spec) => a(spec)))
		// before calling `spec()`,
		// `spec.mode` is `undefined`.
		// This is because the work is done within a pending promise,
		// which is resolved when `spec()` is called.
		await spec({})
		expect(spec.mode).toBe('live')
	})

	test('override to save mode', async () => {
		const { config, context, stackFrame } = createContext({ io: newMemoryIO() })
		mockto = createMockto({ context, stackFrame })
		config({ overrideMode: 'save' })
		await new Promise<Spec>(a => mockto('override to save mode', (_, spec) => a(spec))).then(async spec => {
			await spec({})
			await spec.done()
		})
		await new Promise<Spec>(a => mockto('override to save mode', (_, spec) => a(spec))).then(async spec => {
			await spec({})
			expect(spec.mode).toBe('save')
		})
	})

	test('enable log', async () => {
		const { context, config, stackFrame } = createContext()
		config({ logLevel: logLevels.all })
		mockto = createMockto({ context, stackFrame })
		return new Promise<{ spec: Spec; reporter: MemoryLogReporter }>(a =>
			mockto('log enabled', (_, spec, reporter) => a({ spec, reporter }))
		).then(async ({ spec, reporter }) => {
			await spec({})
			a.satisfies(reporter.logs, [{ level: logLevels.trace }])
		})
	})
})

describe('config with env', () => {
	let mockto: Mockto
	afterEach(() => {
		if (mockto) return mockto.cleanup()
	})

	test('override as live mode', () => {
		process.env[MOCKTOMATA_MODE] = 'live'
		mockto = createMockto(createContext())
		return new Promise<Spec>(a => mockto('override to live mode', (_, spec) => a(spec))).then(async spec => {
			await spec({})
			expect(spec.mode).toBe('live')
		})
	})

	test('override to save mode', async () => {
		process.env[MOCKTOMATA_MODE] = 'save'
		mockto = createMockto(createContext())
		await new Promise<Spec>(a => mockto('override to save mode', (_, spec) => a(spec))).then(async spec => {
			await spec({})
			await spec.done()
		})
		await new Promise<Spec>(a => mockto('override to save mode', (_, spec) => a(spec))).then(async spec => {
			await spec({})
			expect(spec.mode).toBe('save')
		})
	})

	test('mode is case insensitive', () => {
		process.env[MOCKTOMATA_MODE] = 'lIvE'
		mockto = createMockto(createContext())
		return new Promise<Spec>(a => mockto('overide to live mode', (_, spec) => a(spec))).then(async spec => {
			await spec({})
			expect(spec.mode).toBe('live')
		})
	})

	test('override mode with file filter', () => {
		process.env[MOCKTOMATA_MODE] = 'live'
		process.env[MOCKTOMATA_FILE_PATH_FILTER] = 'config.spec'
		mockto = createMockto(createContext())
		return new Promise<Spec>(a => mockto('overide to live mode', (_, spec) => a(spec))).then(async spec => {
			await spec({})
			expect(spec.mode).toBe('live')
		})
	})

	test('not matching file filler will not override mode', () => {
		process.env[MOCKTOMATA_MODE] = 'live'
		process.env[MOCKTOMATA_FILE_PATH_FILTER] = 'something else'
		mockto = createMockto(createContext({ io: newMemoryIO() }))
		return new Promise<Spec>(a => mockto('still in save mode', (_, spec) => a(spec))).then(async spec => {
			await spec({})
			expect(spec.mode).toBe('save')
		})
	})

	test('override with spec filter', async () => {
		process.env[MOCKTOMATA_MODE] = 'live'
		process.env[MOCKTOMATA_SPEC_NAME_FILTER] = 'filtered'
		mockto = createMockto(createContext())
		await new Promise<Spec>(a => mockto('this match filtered', (_, spec) => a(spec))).then(async spec => {
			await spec({})
			expect(spec.mode).toBe('live')
		})
		await new Promise<Spec>(a => mockto('this does not match', (_, spec) => a(spec))).then(async spec => {
			await spec({})
			expect(spec.mode).toBe('save')
		})
	})

	test('spec match file not match will not override', async () => {
		process.env[MOCKTOMATA_MODE] = 'live'
		process.env[MOCKTOMATA_SPEC_NAME_FILTER] = 'still'
		process.env[MOCKTOMATA_FILE_PATH_FILTER] = 'something else'
		mockto = createMockto(createContext({ io: newMemoryIO() }))
		return new Promise<Spec>(a => mockto('still in save mode', (_, spec) => a(spec))).then(async spec => {
			await spec({})
			expect(spec.mode).toBe('save')
		})
	})

	test('spec not match file match will not override', async () => {
		process.env[MOCKTOMATA_MODE] = 'live'
		process.env[MOCKTOMATA_SPEC_NAME_FILTER] = 'not match'
		process.env[MOCKTOMATA_FILE_PATH_FILTER] = 'config.spec'
		mockto = createMockto(createContext({ io: newMemoryIO() }))
		return new Promise<Spec>(a => mockto('still in save mode', (_, spec) => a(spec))).then(async spec => {
			await spec({})
			expect(spec.mode).toBe('save')
		})
	})

	test('both spec and file match will override', async () => {
		process.env[MOCKTOMATA_MODE] = 'live'
		process.env[MOCKTOMATA_SPEC_NAME_FILTER] = 'live'
		process.env[MOCKTOMATA_FILE_PATH_FILTER] = 'config.spec'
		mockto = createMockto(createContext())
		return new Promise<Spec>(a => mockto('override to live mode', (_, spec) => a(spec))).then(async spec => {
			await spec({})
			expect(spec.mode).toBe('live')
		})
	})

	test('enable log', () => {
		process.env[MOCKTOMATA_LOG_LEVEL] = 'trace'
		mockto = createMockto(createContext())
		return new Promise<{ spec: Spec; reporter: MemoryLogReporter }>(a =>
			mockto('log enabled', (_, spec, reporter) => a({ spec, reporter }))
		).then(async ({ spec, reporter }) => {
			await spec({})
			a.satisfies(reporter.logs, [{ level: logLevels.trace }])
		})
	})

	test('enable log is case insensitive', () => {
		process.env[MOCKTOMATA_LOG_LEVEL] = 'tRacE'
		mockto = createMockto(createContext())
		return new Promise<{ spec: Spec; reporter: MemoryLogReporter }>(a =>
			mockto('log enabled', (_, spec, reporter) => a({ spec, reporter }))
		).then(async ({ spec, reporter }) => {
			await spec({})
			a.satisfies(reporter.logs, [{ level: logLevels.trace }])
		})
	})
})
