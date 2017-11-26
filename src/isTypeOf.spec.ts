import test from 'ava'

import { createSatisfier, isTypeOf } from './index'

test('check type of property', t => {
  t.true(createSatisfier({ a: isTypeOf('number') }).test({ a: 1 }))
  t.false(createSatisfier({ a: isTypeOf('number') }).test({ a: false }))
  t.false(createSatisfier({ a: isTypeOf('number') }).test({ a: 'a' }))

  t.false(createSatisfier({ a: isTypeOf('boolean') }).test({ a: 1 }))
  t.true(createSatisfier({ a: isTypeOf('boolean') }).test({ a: false }))
  t.false(createSatisfier({ a: isTypeOf('boolean') }).test({ a: 'a' }))

  t.false(createSatisfier({ a: isTypeOf('string') }).test({ a: 1 }))
  t.false(createSatisfier({ a: isTypeOf('string') }).test({ a: false }))
  t.true(createSatisfier({ a: isTypeOf('string') }).test({ a: 'a' }))
})

test('nicer toString()', t => {
  t.is(isTypeOf('number').toString(), 'typeof number')
})
