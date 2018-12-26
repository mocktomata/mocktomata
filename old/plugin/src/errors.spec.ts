import t from 'assert'

import { SimulationMismatch } from '.'

const expectedAction = { type: 'function', name: 'invoke', payload: [0, 'a'] }
const actualCallbackAction = { type: 'komondor', name: 'callback', payload: { a: 1 }, meta: { id: 3 } }

test('SimulationMismatch error', () => {
  const err = new SimulationMismatch('some id', expectedAction, actualCallbackAction)
  t.strictEqual(err.specId, 'some id')
  t.strictEqual(err.expected, expectedAction)
  t.strictEqual(err.actual, actualCallbackAction)
  t.strictEqual(err.message, `Recorded data for 'some id' doesn't match with simulation. Expecting { type: 'function', name: 'invoke', payload: [0, 'a'] } but received { type: 'komondor', name: 'callback', payload: { a: 1 }, meta: { id: 3 } }`)
})

test('SimulationMismatch error, received action optional', () => {
  const err = new SimulationMismatch('some id', expectedAction)
  t.strictEqual(err.specId, 'some id')
  t.strictEqual(err.expected, expectedAction)
  t.strictEqual(err.message, `Recorded data for 'some id' doesn't match with simulation. Expecting { type: 'function', name: 'invoke', payload: [0, 'a'] } but received undefined`)
})
