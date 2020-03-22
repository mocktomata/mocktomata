import a, { AssertOrder } from 'assertron'
import { logLevels, captureLogs } from 'standard-log'
import { incubator, SpecNotFound } from '..'
import { log } from '../log'

incubator('enable log only lasts through one spec', (title, spec) => {
  test(title, async () => {
    await captureLogs(log, async () => {
      const origLevel = log.level
      spec.enableLog()
      const s = await spec((x: number) => x + 1)
      expect(s(4)).toBe(5)
      await spec.done()
      expect(log.level).toBe(origLevel)
    })
  })
})
incubator('enableLog can specify log level', (title, spec) => {
  test(title, async () => {
    await captureLogs(log, async () => {
      spec.enableLog(logLevels.none)
      await spec(() => { })
      await spec.done()
    })
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

