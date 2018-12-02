import t from 'assert'
import { AssertOrder } from 'assertron'
import fs from 'fs'

import { testLive, testSave, testSimulate, testTrio } from '.'


testTrio('trio', (title, spec) => {
  test(title, async () => {
    const s = await spec(() => {
      return 'foo'
    })

    t.equal(s.subject(), 'foo')

    await s.satisfy([])
    t(fs.existsSync('__komondor__/specs/trio.json') === true)
  })
})

testTrio('custom description', 'trioCustom', (title, spec) => {
  test(title, async () => {
    const s = await spec(() => {
      return 'foo'
    })

    t.equal(s.subject(), 'foo')

    await s.satisfy([])
    t(fs.existsSync('__komondor__/specs/trioCustom.json') === true)
  })
})

testLive('live', (title, spec) => {
  test(title, async () => {
    const o = new AssertOrder(1)
    const s = await spec(() => {
      o.once(1)
      return 'foo'
    })

    t.equal(s.subject(), 'foo')

    await s.satisfy([])
    t(fs.existsSync('__komondor__/specs/live.json') === false)
    o.end()
  })
})


testLive('custom description', 'liveCustom', (description, spec) => {
  test(description, async () => {
    const o = new AssertOrder(1)
    const s = await spec(() => {
      o.once(1)
      return 'foo'
    })

    t.equal(s.subject(), 'foo')

    await s.satisfy([])
    t(fs.existsSync('__komondor__/specs/liveCustom.json') === false)
    o.end()
  })
})

testSave('save', (description, spec) => {
  test(description, async () => {
    const o = new AssertOrder(1)
    const s = await spec(() => {
      o.once(1)
      return 'foo'
    })

    t.equal(s.subject(), 'foo')

    await s.satisfy([])
    t(fs.existsSync('__komondor__/specs/save.json') === true)
    o.end()
  })
})

testSave('custom description', 'saveCustom', (description, spec) => {
  test(description, async () => {
    const o = new AssertOrder(1)
    const s = await spec(() => {
      o.once(1)
      return 'foo'
    })

    t.equal(s.subject(), 'foo')

    await s.satisfy([])
    t(fs.existsSync('__komondor__/specs/saveCustom.json') === true)
    o.end()
  })
})

testSimulate('simulate', (description, spec) => {
  test(description, async () => {
    const s = await spec(() => {
      throw new Error('should not run')
    })

    t.equal(s.subject(), 'foo')

    await s.satisfy([])
  })
})

testSimulate('custom description', 'simulateCustom', (description, spec) => {
  test(description, async () => {
    const s = await spec(() => {
      throw new Error('should not run')
    })

    t.equal(s.subject(), 'foo')

    await s.satisfy([])
  })
})
