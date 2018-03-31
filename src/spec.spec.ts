import t from 'assert'
import a from 'assertron'
import { SimulationMismatch } from 'komondor-plugin'

import { spec, SpecNotFound, NotSpecable, MissingReturnRecord } from '.'
import { simpleCallback } from './function/testSuites'

test('simulate but file does not exists', async () => {
  a.throws(spec.simulate('not exist', x => x), SpecNotFound)
})

test('subject not specable will throw', async () => {
  await a.throws(spec(true), NotSpecable)
})

test('missing return record will throw', async () => {
  const subject = () => 3
  const s = await spec.simulate('spec/missedReturn', subject)

  const err = await a.throws(() => s.subject(), MissingReturnRecord)
  t.equal(err.message, 'No return record found. Corrupted spec?')
})

test('missing record will throw', async () => {
  const s = await spec.simulate('spec/incompleteRecords', simpleCallback.success)

  t.equal(await simpleCallback.increment(s.subject, 2), 3)
  return a.throws(simpleCallback.increment(s.subject, 4), SimulationMismatch)
})