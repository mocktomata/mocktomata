import a from 'assertron';
import { SimulationMismatch } from '.';
import { SpecAction } from './spec/types';
// import { createTestHarness } from './createTestHarness';

const expected: SpecAction = { name: 'invoke', payload: [0, 'a'], instanceId: 1, invokeId: 2 }
const actual: SpecAction = { name: 'construct', payload: ['a'], instanceId: 1 }

// let harness: ReturnType<typeof createTestHarness>

beforeAll(() => {
  // harness = createTestHarness('errors')
})

describe('SimulationMismatch', () => {
  test('Two different actions', () => {
    const err = new SimulationMismatch('different action', expected, actual)
    a.satisfies(err, {
      specId: 'different action',
      expected,
      actual,
      message: `Recorded data for 'different action' doesn't match with simulation. Expecting an invoke action but received a construct action`
    })
  })

  test('no actual action', () => {
    const err = new SimulationMismatch('no action', expected)
    a.satisfies(err, {
      specId: 'no action',
      expected,
      message: `Recorded data for 'no action' doesn't match with simulation. Expecting an invoke action but received none`
    })
  })
})
