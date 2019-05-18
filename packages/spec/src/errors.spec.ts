import a from 'assertron';
import { SimulationMismatch } from '.';

const expected = { type: 'invoke' }
const actual = { type: 'construct' }

describe('SimulationMismatch', () => {
  test('Two different actions', () => {
    const err = new SimulationMismatch('different action', { type: 'invoke' }, { type: 'construct' })
    a.satisfies(err, {
      specId: 'different action',
      expected,
      actual,
      message: `Recorded data for 'different action' doesn't match with simulation. Expecting an invoke action but received a construct action`
    })
  })

  test('no actual action', () => {
    const err = new SimulationMismatch('no action', { type: 'invoke' })
    a.satisfies(err, {
      specId: 'no action',
      expected,
      message: `Recorded data for 'no action' doesn't match with simulation. Expecting an invoke action but received none`
    })
  })
})
