import a, { AssertOrder } from 'assertron'
import { some } from 'satisfier'
import { logLevels, MemoryLogReporter } from 'standard-log'
import { createTestContext, incubator, Spec, SpecNotFound } from '../index.js'
import { createIncubator } from './createIncubator.js'

incubator('can specify log level', { logLevel: logLevels.none }, (specName, spec) => {
  test(specName, async () => {
    await spec(() => { })
    await spec.done()
  })
})

incubator.save('save', (specName, spec) => {
  test(specName, async () => {
    const subject = await spec({ a: 1 })
    expect(subject.a).toBe(1)
    subject.a = 2
    expect(subject.a).toBe(2)
    await spec.done()
  })
})

incubator.simulate('simulate', (specName, spec) => {
  test(specName, async () => {
    a.throws(() => spec({ a: 1 }), SpecNotFound)
  })
})

incubator('duo', (specName, spec) => {
  const o = new AssertOrder(1)
  test(specName, async () => {
    const s = await spec((x: number) => {
      o.once(1)
      return x + 1
    })
    expect(s(1)).toBe(2)
    await spec.done()
  })
})

incubator('duo with option', { timeout: 200 }, (specName, spec) => {
  const o = new AssertOrder(1)
  test(specName, async () => {
    const s = await spec((x: number) => {
      o.once(1)
      return x + 1
    })
    expect(s(1)).toBe(2)
    await spec.done()
  })
})

describe('reporter', () => {
  const { context } = createTestContext()
  const incubator = createIncubator(context)
  incubator.sequence('gets memory log reporter', { logLevel: logLevels.all }, (specName, { save, simulate }, reporter) => {
    test(specName, async () => {
      const subject = { a: 1 }
      const spy = await save(subject)
      expect(spy.a).toBe(1)
      await save.done()

      const stub = await simulate(subject)
      expect(stub.a).toBe(1)
      await simulate.done()

      const messages = reporter.getLogMessagesWithIdAndLevel()
      a.satisfies(messages, some(
        /^mocktomata:gets memory log reporter:save/
      ))
      a.satisfies(messages, some(
        /^mocktomata:gets memory log reporter:simulate/
      ))
    })
  })

})

describe('teardown()', () => {
  it('teardown any not done spec', async () => {
    const { context } = createTestContext()
    const incubator = createIncubator(context)
    const { spec, reporter } = await new Promise<{ spec: Spec, reporter: MemoryLogReporter }>(
      a => incubator.save('teardown', (_, spec, reporter) => a({ spec, reporter }))
    )
    const foo = await spec(() => { })
    foo()
    // await spec.done()
    await incubator.teardown()
    const messages = reporter.getLogMessages()
    a.satisfies(messages, some(/teardown: done\(\) was not called/))
  })
})
