import { createScenario, createTestContext } from '../index.js'

describe(`scenario`, () => {
  const { context } = createTestContext()
  const scenario = createScenario(context)

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

