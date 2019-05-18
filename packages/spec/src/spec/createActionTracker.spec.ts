import a from 'assertron';
import { NotSpecable, SimulationMismatch } from '../errors';
import { createActionTracker } from './createActionTracker';

test('pass with no actions', () => {
  const tracker = createActionTracker('no actions', [])
  tracker.end()
})

test('throws SimulationMismatch if there are remaining actions', () => {
  const tracker = createActionTracker('has remaining', [{
    type: 'invoke',
    payload: [],
    subjectInfo: { plugin: 'echo', subjectId: 1, invokeId: 1 }
  }])
  a.throws(() => tracker.end(), SimulationMismatch)
})

test('action with not supported plugin throws NotSpecable', () => {
  const tracker = createActionTracker('not specable', [{
    type: 'invoke',
    payload: [],
    subjectInfo: { plugin: 'unknown', subjectId: 1, invokeId: 1 }
  }])

  a.throws(() => tracker.getStub(Symbol()), NotSpecable)
})

