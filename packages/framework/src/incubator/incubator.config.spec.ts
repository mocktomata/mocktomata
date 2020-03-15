import { activate as decrementActivate } from './decrementPlugin'
import { activate } from './incrementPlugin'
import { incubator } from './incubator'


beforeAll(() => incubator.config({
  plugins: [['incrementPlugin', activate]]
}))


incubator.duo('increment plugin is loaded', (title, spec) => {
  test(title, async () => {
    const s = await spec((x: number) => x)
    expect(s(1)).toBe(2)

    await spec.done()
  })
})

describe('use decrement', () => {
  beforeAll(() => incubator.config({
    plugins: [['decrement', decrementActivate]]
  }))

  // can't find a way to hack in the AsyncContext protection! :)
  incubator.duo('call config again replaces the plugins', (title, spec) => {
    test(title, async () => {
      const s = await spec((x: number) => x)
      expect(s(2)).toBe(1)
      await spec.done()
    })
  })
})
