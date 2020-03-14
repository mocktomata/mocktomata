import { activate } from './incrementPlugin'
import { incubator } from './incubator'


beforeAll(() => {
  incubator.config({
    plugins: [['incrementPlugin', activate]]
  })
})


incubator.duo('increment plugin is loaded', (title, spec) => {
  test(title, async () => {
    const s = await spec((x: number) => x)
    expect(s(1)).toBe(2)

    await spec.done()
  })
})
