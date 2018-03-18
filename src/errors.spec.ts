import t from 'assert'

import { SimulationMismatch } from '.'

test('SimulationMismatch error', () => {
  const action = { type: 'fn/callback', payload: { a: 1 }, meta: { functionId: 3 } }
  const err = new SimulationMismatch('some id', 'fn/invoke', action)
  t.equal(err.id, 'some id')
  t.equal(err.expectedAction, 'fn/invoke')
  t.equal(err.receivedAction, action)
  t.equal(err.message, `Recorded data for 'some id' doesn't match with simulation. Expecting action type 'fn/invoke' but received: { type: 'fn/callback', payload: { a: 1 }, meta: { functionId: 3 } }`)
})

test('SimulationMismatch error, received action optional', () => {
  const err = new SimulationMismatch('some id', 'fn/invoke')
  t.equal(err.id, 'some id')
  t.equal(err.expectedAction, 'fn/invoke')
  t.equal(err.message, 'Recorded data for \'some id\' doesn\'t match with simulation. Expecting action type \'fn/invoke\' but received: undefined')
})

test('SimulationMismatch error with expected action as SpecAction', () => {
  const expectedAction = { type: 'fn/invoke', payload: [0, 'a'] }
  const action = { type: 'fn/callback', payload: { a: 1 }, meta: { functionId: 3 } }
  const err = new SimulationMismatch('some id', expectedAction, action)
  t.equal(err.id, 'some id')
  t.equal(err.expectedAction, expectedAction)
  t.equal(err.receivedAction, action)
  t.equal(err.message, `Recorded data for 'some id' doesn't match with simulation. Expecting action type { type: 'fn/invoke', payload: [0, 'a'] } but received: { type: 'fn/callback', payload: { a: 1 }, meta: { functionId: 3 } }`)
})
