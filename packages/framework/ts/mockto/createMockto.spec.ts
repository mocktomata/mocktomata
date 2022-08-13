import a from 'assertron'
import { captureLogs, logLevels } from 'standard-log'
import { createMockto, SpecNotFound } from '../index.js'
import { log } from '../log.js'
import { createTestContext, getCallerRelativePath } from '../test-utils/index.js'

const context = createTestContext()
const mockto = createMockto(context)

afterAll(() => mockto.teardown())

test('live with no options', () => {
  const title = 'live with no options'
  return new Promise<void>(a => {
    mockto.live(title, async (specName, spec) => {
      expect(specName).toEqual(`${title}: live`)
      const s = await spec((x: number) => x + 1)
      expect(s(1)).toBe(2)
      await spec.done()
      a()
    })
  })
})

test('live with options', () => {
  const title = 'live with options'
  return new Promise<void>(a => {
    mockto.live(title, { timeout: 2000 }, (specName, spec) => {
      expect(specName).toEqual(`${title}: live`)
      spec((x: number) => x + 1).then(s => {
        expect(s(1)).toBe(2)
        a()
      })
    })
  })
})

test('live has enableLog method', () => {
  const context = createTestContext()
  const mockto = createMockto(context)
  return new Promise<void>(a => {
    mockto.live('live has enableLog method', async (_, spec) => {
      await spec(() => { })
      spec.enableLog()
      a()
    })
  })
})

test('live enableLog method can specify log level', () => {
  const context = createTestContext()
  const mockto = createMockto(context)
  return new Promise<void>(a => {
    mockto.live('ive enableLog method can specify log level', async (_, spec) => {
      await spec(() => { })
      spec.enableLog(logLevels.none)
      a()
    })
  })
})

test('save with no options', async () => {
  const title = 'save with no options'
  await new Promise<void>(a => {
    mockto.save(title, (specName, spec) => {
      expect(specName).toEqual(`${title}: save`)
      spec((x: number) => x + 1).then(async s => {
        expect(s(1)).toBe(2)
        await spec.done()
        a()
      })
    })
  })

  const { io } = await context.get()
  const record = await io.readSpec(title, getCallerRelativePath(() => { }))
  expect(record).not.toBeUndefined()
})

test('save with options', async () => {
  const title = 'save with options'
  await new Promise<void>(a => {
    mockto.save(title, { timeout: 100 }, (specName, spec) => {
      expect(specName).toEqual(`${title}: save`)
      spec((x: number) => x + 1).then(async s => {
        expect(s(1)).toBe(2)
        await spec.done()
        a()
      })
    })
  })

  const { io } = await context.get()
  const record = await io.readSpec(title, getCallerRelativePath(() => { }))
  expect(record).not.toBeUndefined()
})

test('simulate with no options', async () => {
  const title = 'simulate with no options'
  await new Promise<void>(r => {
    mockto.simulate(title, (specName, spec) => {
      expect(specName).toEqual(`${title}: simulate`)
      a.throws(() => spec((x: number) => x + 1), SpecNotFound)
      r()
    })
  })
})

test('simulate with options', async () => {
  const title = 'simulate with options'
  await new Promise<void>(r => {
    mockto.simulate(title, { timeout: 100 }, (specName, spec) => {
      expect(specName).toEqual(`${title}: simulate`)
      a.throws(() => spec((x: number) => x + 1), SpecNotFound)
      r()
    })
  })
})

test('auto with no options', async () => {
  const title = 'auto with no options'
  await new Promise<void>(a => {
    mockto(title, (specName, spec) => {
      expect(specName).toEqual(title)
      spec((x: number) => x + 1).then(async s => {
        expect(s(1)).toBe(2)
        await spec.done()
        a()
      })
    })
  })

  const { io } = await context.get()
  const record = await io.readSpec(title, getCallerRelativePath(() => { }))
  expect(record).not.toBeUndefined()

  await new Promise<void>(a => {
    mockto(title, (_, spec) => {
      spec(() => { throw new Error('should not reach') }).then(async (s: any) => {
        expect(s(1)).toBe(2)
        await spec.done()
        a()
      })
    })
  })
})

test('auto with options', async () => {
  const title = 'auto with options'
  await new Promise<void>(a => {
    mockto(title, { timeout: 100 }, (specName, spec) => {
      expect(specName).toEqual(title)
      spec((x: number) => x + 1).then(async s => {
        expect(s(1)).toBe(2)
        await spec.done()
        a()
      })
    })
  })

  const { io } = await context.get()
  const record = await io.readSpec(title, getCallerRelativePath(() => { }))
  expect(record).not.toBeUndefined()

  await new Promise<void>(a => {
    mockto(title, { timeout: 100 }, (_, spec) => {
      spec(() => { throw new Error('should not reach') }).then(async (s: any) => {
        expect(s(1)).toBe(2)
        await spec.done()
        a()
      })
    })
  })

})

mockto('can enable log after spec subject is created', (title, spec) => {
  test(title, async () => {
    await captureLogs(log, async () => {
      const s = await spec(() => 1)
      spec.enableLog()
      expect(s()).toBe(1)
      await spec.done()
    })
  })
})

describe('config', () => {
  test('override to live mode', async () => {
    const context = createTestContext({ config: { overrideMode: 'live' } })
    const mockto = createMockto(context)
    await new Promise<void>(a => {
      mockto('force live', async (_, spec) => {
        (await spec(() => { }))()
        await spec.done()
        a()
      })
    })
    const { io } = await context.get()
    await a.throws(io.readSpec('force live', ''), SpecNotFound)
  })

  test('overrideMode has no effect on save and simulate', async () => {
    const context = createTestContext({ config: { overrideMode: 'live' } })
    const mockto = createMockto(context)
    await new Promise<void>(a => {
      mockto.save('force live', async (_, spec) => {
        (await spec(() => { }))()
        await spec.done()
        a()
      })
    })
    await new Promise<void>(a => {
      mockto.simulate('force live', async (_, spec) => {
        (await spec(() => { }))()
        await spec.done()
        a()
      })
    })
  })

  test('overrideMode for specific spec name', async () => {
    const context = createTestContext({
      config: {
        overrideMode: 'live',
        specNameFilter: 'to-live',
      }
    })
    const mockto = createMockto(context)
    await new Promise<void>(a => {
      mockto('not affected', async (_, spec) => {
        (await spec(() => { }))()
        await spec.done()
        a()
      })
    })
    await new Promise<void>(a => {
      mockto('a to-live spec', async (_, spec) => {
        (await spec(() => { }))()
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
  mockto.live('explicit live mode returns sensitive info', (title, spec) => {
    test(title, async () => {
      spec.maskValue('secret')
      const s = await spec((v: string) => v)
      const actual = s('secret')
      expect(actual).toBe('secret')
    })
  })
})
