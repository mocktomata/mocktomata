import { createMockto, createTestIO, Spec } from '@mocktomata/framework'
import a from 'assertron'
import { captureLogs, logLevel, logLevels } from 'standard-log'
import { CannotConfigAfterUsed, config, mockto } from '..'
import { log } from '../log'
import { ENV_VARS } from './constants'
import { createContext } from './createContext'
import { store } from './store'

afterEach(() => {
  store.reset()
  delete process.env[ENV_VARS.mode]
  delete process.env[ENV_VARS.log]
  delete process.env[ENV_VARS.fileFilter]
  delete process.env[ENV_VARS.specFilter]
  log.level = undefined
})

describe('config with config()', () => {
  mockto('config() can only be called before using mockto', (title, spec) => {
    test(title, async () => {
      await spec({})
      a.throws(() => config({}), CannotConfigAfterUsed)
    })
  })

  test('override to live mode', () => {
    const mockto = createMockto(createContext())
    config({ overrideMode: 'live' })
    return new Promise<Spec>(a => mockto('override to live mode', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        expect(spec.mode).toBe('live')
      })
  })

  test('override to save mode', async () => {
    const mockto = createMockto(createContext({ io: createTestIO() }))
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

  test('enable log', () => {
    const mockto = createMockto(createContext())
    config({ logLevel: logLevels.all })
    return new Promise<Spec>(a => mockto('log enabled', (_, spec) => a(spec)))
      .then(async spec => {
        const [, logs] = await captureLogs(log, () => spec({}))
        a.satisfies(logs, [{ level: logLevels.debug }])
      })
  })
})

describe('config with env', () => {
  test('override as live mode', () => {
    process.env[ENV_VARS.mode] = 'live'
    const mockto = createMockto(createContext())
    return new Promise<Spec>(a => mockto('overide to live mode', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        expect(spec.mode).toBe('live')
      })
  })

  test('override to save mode', async () => {
    process.env[ENV_VARS.mode] = 'save'
    const mockto = createMockto(createContext({ io: createTestIO() }))
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
    process.env[ENV_VARS.mode] = 'simulate'
    const mockto = createMockto(createContext())
    return new Promise<Spec>(a => mockto('invalid override value emits warning', (_, spec) => a(spec)))
      .then(async spec => {
        const [, entries] = await captureLogs(log, async () => {
          await spec({})
          expect(spec.mode).toBe('save')
        })
        a.satisfies(entries, [{ level: logLevel.warn, args: [/invalid value for mode/] }])
      })
  })

  test('mode is case insensitive', () => {
    process.env[ENV_VARS.mode] = 'lIvE'
    const mockto = createMockto(createContext())
    return new Promise<Spec>(a => mockto('overide to live mode', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        expect(spec.mode).toBe('live')
      })
  })

  test('override mode with file filter', () => {
    process.env[ENV_VARS.mode] = 'live'
    process.env[ENV_VARS.fileFilter] = 'config.spec'
    const mockto = createMockto(createContext())
    return new Promise<Spec>(a => mockto('overide to live mode', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        expect(spec.mode).toBe('live')
      })
  })

  test('not matching file filler will not override mode', () => {
    process.env[ENV_VARS.mode] = 'live'
    process.env[ENV_VARS.fileFilter] = 'something else'
    const mockto = createMockto(createContext({ io: createTestIO() }))
    return new Promise<Spec>(a => mockto('still in save mode', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        expect(spec.mode).toBe('save')
      })
  })

  test('override with spec filter', async () => {
    process.env[ENV_VARS.mode] = 'live'
    process.env[ENV_VARS.specFilter] = 'filtered'
    const mockto = createMockto(createContext())
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
    const mockto = createMockto(createContext({ io: createTestIO() }))
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
    const mockto = createMockto(createContext({ io: createTestIO() }))
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
    const mockto = createMockto(createContext({ io: createTestIO() }))
    return new Promise<Spec>(a => mockto('override to live mode', (_, spec) => a(spec)))
      .then(async spec => {
        await spec({})
        expect(spec.mode).toBe('live')
      })
  })

  test('enable log', () => {
    process.env[ENV_VARS.log] = 'debug'
    const mockto = createMockto(createContext())
    return new Promise<Spec>(a => mockto('log enabled', (_, spec) => a(spec)))
      .then(async spec => {
        const [, logs] = await captureLogs(log, () => spec({}))
        a.satisfies(logs, [{ level: logLevels.debug }])
      })
  })

  test('enable log is case insensitive', () => {
    process.env[ENV_VARS.log] = 'debUg'
    const mockto = createMockto(createContext())
    return new Promise<Spec>(a => mockto('log enabled', (_, spec) => a(spec)))
      .then(async spec => {
        const [, logs] = await captureLogs(log, () => spec({}))
        a.satisfies(logs, [{ level: logLevels.debug }])
      })
  })

  test('invalid log value emits warning', () => {
    process.env[ENV_VARS.log] = 'not-level'
    const mockto = createMockto(createContext())
    return new Promise<Spec>(a => mockto('invalid override value emits warning', (_, spec) => a(spec)))
      .then(async spec => {
        const [, logs] = await captureLogs(log, () => spec({}))
        a.satisfies(logs, [{ level: logLevel.warn, args: [/invalid value for log level/] }])
      })
  })
})
