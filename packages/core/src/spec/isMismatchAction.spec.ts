import t from 'assert';
import a from 'assertron';
import { isMismatchAction } from './isMismatchAction';
import { SpecAction } from './types';

describe('isMismatchAction()', () => {
  test('ref mismatch returns true', () => {
    t(isMismatchAction(
      specAction({ ref: '1' }),
      specAction({ ref: '2' })
    ))
  })
  test('type mismatch returns true', () => {
    t(isMismatchAction(
      specAction({ type: 'construct' }),
      specAction({ type: 'invoke' })
    ))
  })
  test('payload mismatch returns true', () => {
    t(isMismatchAction(
      specAction({ payload: 1 }),
      specAction({ payload: 2 })
    ))
  })
  test('payload matches return false', () => {
    a.false(isMismatchAction(
      specAction({ payload: [1] }),
      specAction({ payload: [1] })
    ))
  })
  test('payload with function matches null', () => {
    a.false(isMismatchAction(
      specAction({ payload: [1, (x: number) => x + 1] }),
      specAction({ payload: [1, null] })
    ))
  })
  test('payload is error', () => {
    a.false(isMismatchAction(
      specAction({ payload: new Error('foo') }),
      specAction({ payload: { message: 'foo' } })
    ))
  })
})

export function specAction(action: Partial<SpecAction>) {
  return action as SpecAction
}
