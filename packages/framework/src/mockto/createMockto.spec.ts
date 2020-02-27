import a from 'assertron'
import { createMockto } from '..'
import { SpecNotFound } from '../spec'
import { createTestContext } from '../test-utils'

test('live with no options', () => {
  const context = createTestContext()
  const mockto = createMockto(context)
  const title = 'live with no options'
  return new Promise(a => {
    mockto.live(title, (specName, spec) => {
      expect(specName).toEqual(`${title}: live`)
      spec((x: number) => x + 1).then(s => {
        expect(s(1)).toBe(2)
        a()
      })
    })
  })
})

test('live with options', () => {
  const context = createTestContext()
  const mockto = createMockto(context)
  const title = 'live with options'
  return new Promise(a => {
    mockto.live(title, { timeout: 2000 }, (specName, spec) => {
      expect(specName).toEqual(`${title}: live`)
      spec((x: number) => x + 1).then(s => {
        expect(s(1)).toBe(2)
        a()
      })
    })
  })
})

test('save with no options', async () => {
  const context = createTestContext()
  const mockto = createMockto(context)
  const title = 'save with no options'
  await new Promise(a => {
    mockto.save(title, (specName, spec) => {
      expect(specName).toEqual(`${title}: save`)
      spec((x: number) => x + 1).then(async s => {
        expect(s(1)).toBe(2)
        await spec.done()
        a()
      })
    })
  })

  const { io, getCallerRelativePath } = await context.get()
  const record = await io.readSpec(title, getCallerRelativePath(() => { }))
  expect(record).not.toBeUndefined()
})

test('save with options', async () => {
  const context = createTestContext()
  const mockto = createMockto(context)
  const title = 'save with options'
  await new Promise(a => {
    mockto.save(title, { timeout: 100 }, (specName, spec) => {
      expect(specName).toEqual(`${title}: save`)
      spec((x: number) => x + 1).then(async s => {
        expect(s(1)).toBe(2)
        await spec.done()
        a()
      })
    })
  })

  const { io, getCallerRelativePath } = await context.get()
  const record = await io.readSpec(title, getCallerRelativePath(() => { }))
  expect(record).not.toBeUndefined()
})

test('simulate with no options', async () => {
  const context = createTestContext()
  const mockto = createMockto(context)
  const title = 'simulate with no options'
  await new Promise(r => {
    mockto.simulate(title, (specName, spec) => {
      expect(specName).toEqual(`${title}: simulate`)
      a.throws(() => spec((x: number) => x + 1), SpecNotFound)
      r()
    })
  })
})

test('simulate with options', async () => {
  const context = createTestContext()
  const mockto = createMockto(context)
  const title = 'simulate with options'
  await new Promise(r => {
    mockto.simulate(title, { timeout: 100 }, (specName, spec) => {
      expect(specName).toEqual(`${title}: simulate`)
      a.throws(() => spec((x: number) => x + 1), SpecNotFound)
      r()
    })
  })
})

test('auto with no options', async () => {
  const context = createTestContext()
  const mockto = createMockto(context)
  const title = 'auto with no options'
  await new Promise(a => {
    mockto(title, (specName, spec) => {
      expect(specName).toEqual(title)
      spec((x: number) => x + 1).then(async s => {
        expect(s(1)).toBe(2)
        await spec.done()
        a()
      })
    })
  })

  const { io, getCallerRelativePath } = await context.get()
  const record = await io.readSpec(title, getCallerRelativePath(() => { }))
  expect(record).not.toBeUndefined()

  await new Promise(a => {
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
  const context = createTestContext()
  const mockto = createMockto(context)
  const title = 'auto with options'
  await new Promise(a => {
    mockto(title, { timeout: 100 }, (specName, spec) => {
      expect(specName).toEqual(title)
      spec((x: number) => x + 1).then(async s => {
        expect(s(1)).toBe(2)
        await spec.done()
        a()
      })
    })
  })

  const { io, getCallerRelativePath } = await context.get()
  const record = await io.readSpec(title, getCallerRelativePath(() => { }))
  expect(record).not.toBeUndefined()

  await new Promise(a => {
    mockto(title, { timeout: 100 }, (_, spec) => {
      spec(() => { throw new Error('should not reach') }).then(async (s: any) => {
        expect(s(1)).toBe(2)
        await spec.done()
        a()
      })
    })
  })
})