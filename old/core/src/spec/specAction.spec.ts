import t from 'assert'
import a from 'assertron'

import { makeSerializableAction, isMismatchAction } from './specAction'
import { BaseError } from 'make-error'

test('serialize error', () => {
  const actual = makeSerializableAction({ payload: new Error('foo') })
  t.deepStrictEqual(actual.payload, { message: 'foo', prototype: 'Error' })
})

test('serialize custom error', () => {
  class CustomError extends BaseError {
    // istanbul ignore next
    constructor(public value: any) {
      super(`error with ${value}`)

      Object.setPrototypeOf(this, new.target.prototype)
    }
  }
  const actual = makeSerializableAction({ payload: new CustomError('cat') })
  t.deepStrictEqual(actual.payload, { message: 'error with cat', value: 'cat', prototype: 'Error' })
})

test('circular reference', () => {
  const payload: any[] = [{}]
  payload[0].cir = payload[0]
  const actual = makeSerializableAction({ payload })
  t.deepStrictEqual(actual, { payload: [{ cir: '[circular:0]' }] })
})

describe('isMismatchAction()', () => {
  test('type mismatch returns true', () => {
    t(isMismatchAction({ plugin: 'x' }, { plugin: 'function' }))
  })
  test('name mismatch returns true', () => {
    t(isMismatchAction({ name: 'return' }, { name: 'invoke' }))
  })
  test('payload mismatch returns true', () => {
    t(isMismatchAction({ payload: 1 }, { payload: 2 }))
  })
  test('payload matches return false', () => {
    a.false(isMismatchAction({ payload: [1] }, { payload: [1] }))
  })
  test('payload with function matches null', () => {
    a.false(isMismatchAction({ payload: [1, (x: number) => x + 1] }, { payload: [1, null] }))
  })
  test('payload is error', () => {
    a.false(isMismatchAction({ payload: new Error('foo') }, { payload: { message: 'foo' } }))
  })
})
