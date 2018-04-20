import t from 'assert'

// import isClass from 'isclass'
import { isClass } from './isClass'


test('false for simple function', () => {
  t(!isClass(x => x))
  t(!isClass(function () { return }))
})

test('false for object', () => {
  const obj = {
    f() { return }
  }

  t(!isClass(obj))
})

test('false for method in object', () => {
  const obj = {
    f() { return }
  }
  t(!isClass(obj.f))
})

test('true for class with at lease one method', () => {
  class F { f() { return } }
  t(isClass(F))
})
