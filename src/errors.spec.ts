import { test } from 'ava'

import { SimulationMismatch } from '.'


test('SimulationMismatch error', t => {
  const action = { type: 'fn/callback', payload: { a: 1 }, meta: { functionId: 3 } }
  const err = new SimulationMismatch('some id', 'fn/invoke', action)
  t.is(err.id, 'some id')
  t.is(err.expectedActionType, 'fn/invoke')
  t.is(err.action, action)
})
