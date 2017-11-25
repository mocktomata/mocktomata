import { test } from 'ava'

import { Satisfier } from './index'

test('empty expecter passes everything', t => {
  t.true(new Satisfier({}).test({}))
  t.true(new Satisfier({}).test({ a: 1 }))
  t.true(new Satisfier({}).test({ a: true }))
  t.true(new Satisfier({}).test({ a: 'a' }))
  t.true(new Satisfier({}).test({ a: [1, true, 'a'] }))
  t.true(new Satisfier({}).test({ a: { b: 'a' } }))
  t.true(new Satisfier({}).test([{}, { a: 1 }]))
})

test('mismatch value fails', t => {
  t.false(new Satisfier({ a: 1 }).test({ a: 2 }))
  t.false(new Satisfier({ a: true }).test({ a: false }))
  t.false(new Satisfier({ a: 'a' }).test({ a: 'b' }))
  t.false(new Satisfier({ a: /foo/ }).test({ a: 'b' }))
  t.false(new Satisfier({ a: () => false }).test({ a: 'b' }))
  t.false(new Satisfier([{ a: 1 }, { b: 2 }]).test([{ a: true }, { b: 'b' }, { c: 3 }]))
  t.false(new Satisfier({ a: [1, true, 'a'] }).test({ a: [1, true, 'b'] }))
  // t.false(new Satisfier({ a: { b: 1 } }).test({ a: { b: 2 } }))
})
