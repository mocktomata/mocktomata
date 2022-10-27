import a from 'assertron'
import { logLevels } from 'standard-log'
import { record } from 'type-plus'
import { createMockto, createTestContext, getCallerRelativePath, SpecNotFound } from '../index.js'

describe(`mockto`, () => {
  const { context } = createTestContext()
  const mockto = createMockto(context)

  afterAll(() => mockto.teardown())

  describe(`mockto.live()`, () => {
    test('live with no options', () => {
      const title = 'live with no options'
      return new Promise<void>(a => {
        mockto.live(title, async (specName, spec) => {
          expect(specName).toEqual(title)
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
          expect(specName).toEqual(title)
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
      const { context } = createTestContext()
      const mockto = createMockto(context)
      return new Promise<void>(a => {
        mockto.live('live has enableLog method', { logLevel: logLevels.all }, async (_, spec, reporter) => {
          const s = await spec(() => { })
          s()
          expect(reporter.logs.length > 0).toBe(true)
          a()
        })
      })
    })
  })

  test('save with no options', async () => {
    const title = 'save with no options'
    await new Promise<void>(a => {
      mockto.save(title, (specName, spec) => {
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
  })

  test('save with options', async () => {
    const title = 'save with options'
    await new Promise<void>(a => {
      mockto.save(title, { timeout: 100 }, (specName, spec) => {
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
  })

  test('simulate with no options', async () => {
    const title = 'simulate with no options'
    await new Promise<void>(r => {
      mockto.simulate(title, (specName, spec) => {
        expect(specName).toEqual(title)
        a.throws(() => spec((x: number) => x + 1), SpecNotFound)
        r()
      })
    })
  })

  test('simulate with options', async () => {
    const title = 'simulate with options'
    await new Promise<void>(r => {
      mockto.simulate(title, { timeout: 100 }, (specName, spec) => {
        expect(specName).toEqual(title)
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

  test.todo('spec name supports other characters (standard-log restricts them). Need to transform those chars')

  mockto('can enable log after spec subject is created', { logLevel: logLevels.all }, (title, spec, reporter) => {
    test(title, async () => {
      const s = await spec(() => 1)
      expect(s()).toBe(1)

      await spec.done()

      expect(reporter.logs.length).toBeGreaterThan(0)
      const ids = Object.keys(reporter.logs.reduce((p, log) => {
        p[log.id] = true
        return p
      }, record()))
      expect(ids.length).toEqual(1)
      expect(ids[0]).toMatch(/mocktomata:can enable/)
    })
  })

  describe('config', () => {
    test('override to live mode', async () => {
      const { context } = createTestContext({ config: { overrideMode: 'live' } })
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
      const { context } = createTestContext({ config: { overrideMode: 'live' } })
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
      const { context } = createTestContext({
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
})
