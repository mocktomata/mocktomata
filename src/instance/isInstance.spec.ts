import t from 'assert'

import { isInstance } from './isInstance'

test('primitives is false', () => {
  t.equal(isInstance(1), false)
  t.equal(isInstance(true), false)
  t.equal(isInstance('a'), false)
  t.equal(isInstance(undefined), false)
  t.equal(isInstance(null), false)
})

test('object literal is false', () => {
  t.equal(isInstance({}), false)
  t.equal(isInstance({ a: 1 }), false)
})
test('Empty class instance is true', () => {
  class Foo { }
  t(isInstance(new Foo()))
})
