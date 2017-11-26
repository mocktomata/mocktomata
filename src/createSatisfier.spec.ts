import { test } from 'ava'

import { createSatisfier } from './index'
import { assertExec } from './testUtil'

test('support generics', t => {
  const s = createSatisfier<{ a: number }>({ a: 1 })
  t.true(s.test({ a: 1 }))
  t.false(s.test({ a: 2 }))
})

test('Expecter can be specify partial of the data structure', t => {
  createSatisfier<{ a: number, b: string }>({ a: 1 })
  createSatisfier<{ a: number, b: string }>([{ a: 1 }])
  createSatisfier<{ a: { c: number, d: string }, b: string }>({ a: {} })
  createSatisfier<{ a: { c: number, d: string }, b: string }>([{ a: {} }, { b: /a/ }, { a: { c: 1 } }])
  t.pass()
})

test('nested {} checks for non undefined', t => {
  const s = createSatisfier<{ a: { c: number, d: string }, b: string }>({ a: {} })
  const actual = s.exec({} as any)!
  t.is(actual.length, 1)
  assertExec(t, actual[0], ['a'], {}, undefined)
})

test('actual should be a complete struct', t => {
  const s = createSatisfier<{ a: number, b: string }>({ a: 1, b: 'b' })

  // missing `b`
  // t.true(s.test({ a: 1 }))
  t.true(s.test({ a: 1, b: 'b' }))
})
