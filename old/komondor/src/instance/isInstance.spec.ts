import t from 'assert'

import { isInstance } from './isInstance'

test('primitives is false', () => {
  t.strictEqual(isInstance(1), false)
  t.strictEqual(isInstance(true), false)
  t.strictEqual(isInstance('a'), false)
  t.strictEqual(isInstance(undefined), false)
  t.strictEqual(isInstance(null), false)
})

test('object literal is false', () => {
  t.strictEqual(isInstance({}), false)
  t.strictEqual(isInstance({ a: 1 }), false)
})

test('Empty class instance is true', () => {
  class Foo { }
  t(isInstance(new Foo()))
})

test('object without prototype is false', () => {
  const subject = Object.create(null, {})
  t.strictEqual(isInstance(subject), false)
})
