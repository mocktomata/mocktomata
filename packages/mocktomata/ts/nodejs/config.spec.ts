import { createMockto, createTestIO, Spec } from '@mocktomata/framework'
import a from 'assertron'
import { createStandardLogForTest, logLevels, MemoryLogReporter } from 'standard-log'
import { CannotConfigAfterUsed, config, mockto } from '../index.js'
import { ENV_VARS } from './constants.js'
import { createContext } from './createContext.js'
import { store } from './store.js'

beforeEach(() => {
  store.reset()
  delete process.env[ENV_VARS.mode]
  delete process.env[ENV_VARS.log]
  delete process.env[ENV_VARS.fileFilter]
  delete process.env[ENV_VARS.specFilter]
})

afterEach(() => {
  store.reset()
  delete process.env[ENV_VARS.mode]
  delete process.env[ENV_VARS.log]
  delete process.env[ENV_VARS.fileFilter]
  delete process.env[ENV_VARS.specFilter]
})

mockto('config() can only be called before using mockto', (title, spec) => {
  test(title, async () => {
    await spec({})
    a.throws(() => config({}), CannotConfigAfterUsed)
  })
})

describe('config with config()', () => {
  let mockto: createMockto.Mockto
  afterEach(() => mockto?.teardown())

  test('override to live mode', async () => {
    mockto = createMockto(createContext({ io: createTestIO() }))
    config({ overrideMode: 'live' })
    const spec = await new Promise<Spec>(a => mockto('override to live mode', (_, spec) => a(spec)))
    // before calling `spec()`,
    // `spec.mode` is `undefined`.
    // This is because the work is done within a pending promise,
    // which is resovled when `spec()` is called.
    await spec({})
    expect(spec.mode).toBe('live')
  })

  test('override to save mode', async () => {
    mockto = createMockto(createContext({ io: createTestIO() }))
    config({ overrideMode: 'save' })
    await new Promise<Spec>(a => mockto('override to save mode', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        await spec.done()
      })
    await new Promise<Spec>(a => mockto('override to save mode', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        expect(spec.mode).toBe('save')
      })
  })

  test('enable log', async () => {
    config({ logLevel: logLevels.all })
    const context = createContext()
    mockto = createMockto(context)
    return new Promise<{ spec: Spec, reporter: MemoryLogReporter }>(a => mockto('log enabled', (_, spec, reporter) => a({ spec, reporter })))
      .then(async ({ spec, reporter }) => {
        await spec({})
        a.satisfies(reporter.logs, [{ level: logLevels.debug }])
      })
  })
})

describe('config with env', () => {
  let mockto: createMockto.Mockto
  afterEach(() => {
    if (mockto) return mockto.teardown()
  })

  test('override as live mode', () => {
    process.env[ENV_VARS.mode] = 'live'
    mockto = createMockto(createContext())
    return new Promise<Spec>(a => mockto('overide to live mode', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        expect(spec.mode).toBe('live')
      })
  })

  test('override to save mode', async () => {
    process.env[ENV_VARS.mode] = 'save'
    mockto = createMockto(createContext({ io: createTestIO() }))
    await new Promise<Spec>(a => mockto('override to save mode', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        await spec.done()
      })
    await new Promise<Spec>(a => mockto('override to save mode', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        expect(spec.mode).toBe('save')
      })
  })

  test('invalid override value emits warning', () => {
    process.env[ENV_VARS.mode] = 'something-else'
    const sl = createStandardLogForTest()
    const context = createContext({ log: sl.getLogger('mocktomata') })
    mockto = createMockto(context)
    return new Promise<Spec>(a => mockto('invalid override value emits warning', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        expect(spec.mode).toBe('save')
        a.satisfies(sl.reporter.logs[0], { level: logLevels.warn, args: [/invalid value for mode/] })
      })
  })

  test('mode is case insensitive', () => {
    process.env[ENV_VARS.mode] = 'lIvE'
    mockto = createMockto(createContext())
    return new Promise<Spec>(a => mockto('overide to live mode', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        expect(spec.mode).toBe('live')
      })
  })

  test('override mode with file filter', () => {
    process.env[ENV_VARS.mode] = 'live'
    process.env[ENV_VARS.fileFilter] = 'config.spec'
    mockto = createMockto(createContext())
    return new Promise<Spec>(a => mockto('overide to live mode', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        expect(spec.mode).toBe('live')
      })
  })

  test('not matching file filler will not override mode', () => {
    process.env[ENV_VARS.mode] = 'live'
    process.env[ENV_VARS.fileFilter] = 'something else'
    mockto = createMockto(createContext({ io: createTestIO() }))
    return new Promise<Spec>(a => mockto('still in save mode', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        expect(spec.mode).toBe('save')
      })
  })

  test('override with spec filter', async () => {
    process.env[ENV_VARS.mode] = 'live'
    process.env[ENV_VARS.specFilter] = 'filtered'
    mockto = createMockto(createContext())
    await new Promise<Spec>(a => mockto('this match filtered', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        expect(spec.mode).toBe('live')
      })
    await new Promise<Spec>(a => mockto('this does not match', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        expect(spec.mode).toBe('save')
      })
  })

  test('spec match file not match will not override', async () => {
    process.env[ENV_VARS.mode] = 'live'
    process.env[ENV_VARS.specFilter] = 'still'
    process.env[ENV_VARS.fileFilter] = 'something else'
    mockto = createMockto(createContext({ io: createTestIO() }))
    return new Promise<Spec>(a => mockto('still in save mode', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        expect(spec.mode).toBe('save')
      })
  })

  test('spec not match file match will not override', async () => {
    process.env[ENV_VARS.mode] = 'live'
    process.env[ENV_VARS.specFilter] = 'not match'
    process.env[ENV_VARS.fileFilter] = 'config.spec'
    mockto = createMockto(createContext({ io: createTestIO() }))
    return new Promise<Spec>(a => mockto('still in save mode', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        expect(spec.mode).toBe('save')
      })
  })

  test('both spec and file match will override', async () => {
    process.env[ENV_VARS.mode] = 'live'
    process.env[ENV_VARS.specFilter] = 'live'
    process.env[ENV_VARS.fileFilter] = 'config.spec'
    mockto = createMockto(createContext({ io: createTestIO() }))
    return new Promise<Spec>(a => mockto('override to live mode', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        expect(spec.mode).toBe('live')
      })
  })

  test('enable log', () => {
    process.env[ENV_VARS.log] = 'debug'
    const context = createContext()
    mockto = createMockto(context)
    return new Promise<{ spec: Spec, reporter: MemoryLogReporter }>(
      a => mockto('log enabled', (_, spec, reporter) => a({ spec, reporter }))
    ).then(async ({ spec, reporter }) => {
      await spec({})
      a.satisfies(reporter.logs, [{ level: logLevels.debug }])
    })
  })

  test('enable log is case insensitive', () => {
    process.env[ENV_VARS.log] = 'debUg'
    const context = createContext()
    mockto = createMockto(context)
    return new Promise<{ spec: Spec, reporter: MemoryLogReporter }>(
      a => mockto('log enabled', (_, spec, reporter) => a({ spec, reporter }))
    ).then(async ({ spec, reporter }) => {
      await spec({})
      a.satisfies(reporter.logs, [{ level: logLevels.debug }])
    })
  })

  test('invalid log value emits warning', () => {
    process.env[ENV_VARS.log] = 'not-level'
    const sl = createStandardLogForTest()
    const context = createContext({ log: sl.getLogger('mocktomata') })
    mockto = createMockto(context)
    return new Promise<Spec>(a => mockto('invalid override value emits warning', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        a.satisfies(sl.reporter.logs[0], { level: logLevels.warn, args: [/invalid value for log level/] })
      })
  })
})