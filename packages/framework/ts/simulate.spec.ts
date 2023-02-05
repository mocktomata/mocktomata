import { incubator } from './index.js'

incubator.sequence('get value from return object keeps last value', (specName, { save, simulate }) => {
  function create() { return { a: 1 } }
  it.skip(specName, async () => {
    {
      const s = await save(create)

      const obj = s()
      expect(obj.a).toBe(1)
      expect(obj.a).toBe(1)
      await save.done()
    }
    {
      const s = await simulate(create)

      const obj = s()
      expect(obj.a).toBe(1)
      expect(obj.a).toBe(1)
      expect(obj.a).toBe(1)
      await simulate.done()
    }
  })
})
