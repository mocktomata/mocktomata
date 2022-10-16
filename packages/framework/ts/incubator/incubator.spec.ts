import a, { AssertOrder } from 'assertron'
import { some } from 'satisfier'
import { logLevels } from 'standard-log'
import { incubator, SpecNotFound } from '../index.js'

// TODO: not needed after updating the logging system.
// to be removed.
// test('enable log only lasts through one spec', async () => {
//   const { context } = createTestContext()
//   const incubator = createIncubator(context)
//   const { log } = await context.get()
//   const spec = await new Promise<Spec>(a => incubator('enable log only lasts through one spec', (_, spec) => a(spec)))
//   const origLevel = log.level
//   spec.enableLog()
//   const s = await spec((x: number) => x + 1)
//   expect(s(4)).toBe(5)
//   await spec.done()
//   expect(log.level).toBe(origLevel)
// })

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
