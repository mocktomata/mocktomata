import { a } from 'assertron'
import { createTestContext, createZucchini } from '../index.js'
import { DuplicateStep, MissingStep } from './errors.js'

describe(`scenario`, () => {
  const { context } = createTestContext()
  const { scenario, defineStep } = createZucchini(context)
afterAll(() => scenario.teardown())
  describe(`setup()`, () => {
    it('throws MissingStep if not defined', async () => {
      const { setup } = scenario('no handler')
      a.throws(() => setup('no setup handler'), MissingStep)
    })
  })

  describe('spec()', () => {
    it('is working as expected', async () => {
      const save = scenario('increment')
      let s = await save.spec((x: number) => x + 1)
      expect(s(1)).toBe(2)
      expect(save.mode()).toEqual('save')
      await save.done()

      const simulate = scenario('increment')
      s = await simulate.spec((x: number) => x + 1)
      expect(s(1)).toBe(2)
      expect(simulate.mode()).toEqual('simulate')
      await simulate.done()
    })
  })


  describe(`${defineStep.name}()`, () => {
    it('can be called multiple times with the same arguments', () => {
      const handler = () => { }
      defineStep('same handler', handler)
      defineStep('same handler', handler)
    })

    it('throws DuplicateStep if the step is defined twice', () => {
      defineStep('a', () => 1)
      a.throws(() => defineStep('a', () => 2), DuplicateStep)

      defineStep(/abc/, () => 3)
      a.throws(() => defineStep(/abc/, () => 4), DuplicateStep)
    })
  })

  describe('.live()', () => {
    it('can be called without option', () => {
      scenario.live('live with no options')
    })
  })

  describe('.save()', () => {
    it('can be called without option', () => {
      scenario.save('save with no options')
    })
  })

  describe('.simulate()', () => {
    it('can be called without option', () => {
      scenario.simulate('simulate with no options')
    })
  })
})

