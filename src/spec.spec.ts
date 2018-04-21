import t from 'assert'
import a from 'assertron'
import { SimulationMismatch } from 'komondor-plugin'

import { spec, SpecNotFound, NotSpecable } from '.'
import { simpleCallback } from './function/testSuites'
import k from './testUtil'

test('simulate but file does not exists', async () => {
  a.throws(spec.simulate('not exist', x => x), SpecNotFound)
})

k.trio('subject not specable will throw', 'spec/notSpecable', (title, spec) => {
  test(title, async () => {
    await a.throws(spec(true), NotSpecable)
  })
})

test('missing return record will throw', async () => {
  const subject = () => 3
  const s = await spec.simulate('spec/missedReturn', subject)

  // s.subject()
  // await s.satisfy([])
  await a.throws(() => s.subject(), SimulationMismatch)
})

test('missing record will throw', async () => {
  const s = await spec.simulate('spec/incompleteRecords', simpleCallback.success)

  t.equal(await simpleCallback.increment(s.subject, 2), 3)
  return a.throws(simpleCallback.increment(s.subject, 4), SimulationMismatch)
})

k.trio('done() same as satisfy', 'spec/done', (title, spec) => {
  test(title, async () => {
    const s = await spec(x => x)
    t.equal(s.subject(1), 1)

    await s.done()
  })
})

k.trio('Error payload will pass instanceof', 'spec/errorPassInstanceof', (title, spec) => {
  test(title, async () => {
    const s = await spec(() => { throw new Error('err') })
    const err = await a.throws(() => s.subject())

    t(err instanceof Error)
    await s.done()
  })
})
