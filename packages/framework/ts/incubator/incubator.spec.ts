import a, { AssertOrder } from 'assertron'
import { some } from 'satisfier'
import { logLevels, MemoryLogReporter } from 'standard-log'
import { createTestContext, incubator, Spec, SpecNotFound } from '../index.js'
import { createIncubator } from './createIncubator.js'

incubator('enableLog can specify log level', (title, spec) => {
  test(title, async () => {

    spec.enableLog(logLevels.none)
    await spec(() => { })
    await spec.done()
  })
})

incubator.save('save', (title, spec) => {
  test(title, async () => {
    const subject = await spec({ a: 1 })
    expect(subject.a).toBe(1)
    subject.a = 2
    expect(subject.a).toBe(2)
    await spec.done()
  })
})

incubator.simulate('simulate', (title, spec) => {
  test(title, async () => {
    a.throws(() => spec({ a: 1 }), SpecNotFound)
  })
})

incubator('duo', (title, spec) => {
  const o = new AssertOrder(1)
  test(title, async () => {
    const s = await spec((x: number) => {
      o.once(1)
      return x + 1
    })
    expect(s(1)).toBe(2)
    await spec.done()
  })
})

incubator('duo with option', { timeout: 200 }, (title, spec) => {
  const o = new AssertOrder(1)
  test(title, async () => {
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
  incubator.sequence('gets memory log reporter', (title, { save, simulate }, reporter) => {
    test(title, async () => {
      const subject = { a: 1 }
      save.enableLog()
      const spy = await save(subject)
      expect(spy.a).toBe(1)
      await save.done()

      simulate.enableLog()
      const stub = await simulate(subject)
      expect(stub.a).toBe(1)
      await simulate.done()

      a.satisfies(reporter.getLogMessagesWithIdAndLevel(), some(
        /^mocktomata:gets memory log reporter:save/
      ))
      a.satisfies(reporter.getLogMessagesWithIdAndLevel(), some(
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
