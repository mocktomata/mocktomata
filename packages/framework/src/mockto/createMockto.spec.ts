import a from 'assertron'
import { createMockto, SpecNotFound } from '..'
import { log } from '../log'
import { createTestContext, getCallerRelativePath } from '../test-utils'

const context = createTestContext()
const mockto = createMockto(context)

test('live with no options', () => {
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

  const { io } = await context.get()
  const record = await io.readSpec(title, getCallerRelativePath(() => { }))
  expect(record).not.toBeUndefined()
})

test('save with options', async () => {
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

  const { io } = await context.get()
  const record = await io.readSpec(title, getCallerRelativePath(() => { }))
  expect(record).not.toBeUndefined()
})

test('simulate with no options', async () => {
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

  const { io } = await context.get()
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

  const { io } = await context.get()
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

mockto('can enable log after spec subject is created', (title, spec) => {
  test(title, async () => {
    log.info(title)
    const s = await spec(() => 1)
    spec.enableLog()
    expect(s()).toBe(1)
    await spec.done()
  })
})
