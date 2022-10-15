import { activate as decrementActivate } from './decrementPlugin.mock.js'
import { activate as incrementActivate } from './incrementPlugin.mock.js'
import { incubator } from './incubator.js'

beforeAll(() => incubator.config({
  plugins: [['incrementPlugin', incrementActivate]]
}))

describe('use increment', () => {
  incubator('increment plugin is loaded', (title, spec) => {
    test(title, async () => {
      const s = await spec((x: number) => x)
      expect(s(1)).toBe(2)

      await spec.done()
    })
  })
})

describe('use decrement', () => {
  beforeAll(() => incubator.config({
    plugins: [['decrement', decrementActivate]]
  }))

  // can't find a way to hack in the AsyncContext protection! :)
  incubator('call config again replaces the plugins', (title, spec) => {
    test(title, async () => {
      const s = await spec((x: number) => x)
      expect(s(2)).toBe(1)
      await spec.done()
    })
  })
})
