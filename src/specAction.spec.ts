import t from 'assert'
import a from 'assertron'

import { makeSerializableAction, isMismatchAction } from './specAction'
import { specAction } from './testUtil'
import { BaseError } from 'make-error'

test('serialize error', () => {
  const actual = makeSerializableAction(specAction({ payload: new Error('foo') }))
  t.deepEqual(actual.payload, { message: 'foo', prototype: 'Error' })
})

test('serialize custom error', () => {
  class CustomError extends BaseError {
    // istanbul ignore next
    constructor(public value) {
      super(`error with ${value}`)

      Object.setPrototypeOf(this, new.target.prototype)
    }
  }
  const actual = makeSerializableAction(specAction({ payload: new CustomError('cat') }))
  t.deepEqual(actual.payload, { message: 'error with cat', value: 'cat', prototype: 'Error' })
})

test('circular reference', () => {
  const payload: any[] = [{}]
  payload[0].cir = payload[0]
  const actual = makeSerializableAction(specAction({
    payload
  }))
  t.deepEqual(actual, { payload: [{ cir: '[circular:0]' }] })
})

describe('isMismatchAction()', () => {
  test('type mismatch returns true', () => {
    t(isMismatchAction(
      specAction({ type: 'x' }),
      specAction({ type: 'function' })
    ))
  })
  test('name mismatch returns true', () => {
    t(isMismatchAction(
      specAction({ name: 'y' }),
      specAction({ name: 'invoke' })
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
      specAction({ payload: [1, x => x + 1] }),
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
