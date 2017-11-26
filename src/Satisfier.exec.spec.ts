import { test } from 'ava'

import { Satisfier } from './index'
import { assertExec, assertRegExp } from './testUtil';

test('primitive types', t => {
  t.is(new Satisfier(1).exec(1), null)
  t.is(new Satisfier(true).exec(true), null)
  t.is(new Satisfier('a').exec('a'), null)
})

test('can use generic to specify the data structure', t => {
  t.is(new Satisfier<number>(1).exec(1), null)
  t.is(new Satisfier<{ a: number }>({ a: /1/ }).exec({ a: 1 }), null)
})

test('empty expecter passes everything', t => {
  t.is(new Satisfier({}).exec({}), null)
  t.is(new Satisfier({}).exec({ a: 1 }), null)
  t.is(new Satisfier({}).exec({ a: { b: 'a' } }), null)
  t.is(new Satisfier({}).exec({ a: true }), null)
  t.is(new Satisfier({}).exec({ a: [1] }), null)
})

test('mismatch value gets path, expected, and actual', t => {
  const actual = new Satisfier({ a: 1 }).exec({ a: 2 })!
  t.is(actual.length, 1)
  assertExec(t, actual[0], ['a'], 1, 2)
})

test('missing property get actual as undefined', t => {
  const actual = new Satisfier({ a: 1 }).exec({})!
  t.is(actual.length, 1)
  assertExec(t, actual[0], ['a'], 1, undefined)
})

test('missing property get deeper level', t => {
  const actual = new Satisfier({ a: { b: 1 } }).exec({ a: {} })!
  t.is(actual.length, 1)
  assertExec(t, actual[0], ['a', 'b'], 1, undefined)
})

test('passing regex gets null', t => {
  t.is(new Satisfier({ foo: /foo/ }).exec({ foo: 'foo' }), null)
})

test('failed regex will be in expected property', t => {
  const actual = new Satisfier({ foo: /foo/ }).exec({ foo: 'boo' })!
  assertRegExp(t, actual, ['foo'], /foo/, 'boo')
})

test('regex on missing property gets actual as undefined', t => {
  const actual = new Satisfier({ foo: /foo/ }).exec({})!
  assertRegExp(t, actual, ['foo'], /foo/, undefined)
})

test('regex on non-string will fail as normal', t => {
  let actual = new Satisfier({ foo: /foo/ }).exec({ foo: 1 })!
  assertRegExp(t, actual, ['foo'], /foo/, 1)

  actual = new Satisfier({ foo: /foo/ }).exec({ foo: true })!
  assertRegExp(t, actual, ['foo'], /foo/, true)

  actual = new Satisfier({ foo: /foo/ }).exec({ foo: [1, true, 'a'] })!
  assertRegExp(t, actual, ['foo'], /foo/, [1, true, 'a'])

  actual = new Satisfier({ foo: /foo/ }).exec({ foo: { a: 1 } })!
  assertRegExp(t, actual, ['foo'], /foo/, { a: 1 })
})

test('predicate receives actual value', t => {
  t.is(new Satisfier({ a: a => a === 1 }).exec({ a: 1 }), null)
})

test('passing predicate gets null', t => {
  t.is(new Satisfier({ a: () => true }).exec({}), null)
  t.is(new Satisfier({ a: () => true }).exec({ a: 1 }), null)
})

test('failing predicate', t => {
  const actual = new Satisfier({ a: function () { return false } }).exec({ a: 1 })!
  t.is(actual.length, 1)
  assertExec(t, actual[0], ['a'], 'function () { return false; }', 1)
})

test('against each element in array', t => {
  t.is(new Satisfier({ a: 1 }).exec([{ a: 1 }, { b: 1, a: 1 }]), null)
})

test('against each element in array in deep level', t => {
  const actual = new Satisfier({ a: { b: { c: /foo/ } } }).exec([{ a: {} }, { a: { b: {} } }, { a: { b: { c: 'boo' } } }])!
  t.is(actual.length, 3)
  assertExec(t, actual[0], ['[0]', 'a', 'b'], { c: /foo/ }, undefined)
  assertExec(t, actual[1], ['[1]', 'a', 'b', 'c'], /foo/, undefined)
  assertExec(t, actual[2], ['[2]', 'a', 'b', 'c'], /foo/, 'boo')
})

test('when apply against array, will have indices in the path', t => {
  const actual = new Satisfier({ a: 1 }).exec([{ a: 1 }, {}])!
  t.is(actual.length, 1)
  assertExec(t, actual[0], ['[1]', 'a'], 1, undefined)
})

test('when Expecter is an array, will apply to each entry in the actual array', t => {
  t.is(new Satisfier([{ a: 1 }, { b: 2 }]).exec([{ a: 1 }, { b: 2 }, { c: 3 }]), null)
  const actual = new Satisfier([{ a: 1 }, { b: 2 }]).exec([{ a: true }, { b: 'b' }, { c: 3 }])!
  t.is(actual.length, 2)
  assertExec(t, actual[0], ['[0]', 'a'], 1, true)
  assertExec(t, actual[1], ['[1]', 'b'], 2, 'b')
})

test.skip('when Expecter is an array and actual is not, the behavior is not defined yet', t => {
  const actual = new Satisfier([{ a: 1 }, { b: 2 }]).exec({ a: 1 })!
  t.is(actual.length, 1)
})

test('deep object checking', t => {
  const actual = new Satisfier({ a: { b: 1 } }).exec({ a: { b: 2 } })!
  t.is(actual.length, 1)
  assertExec(t, actual[0], ['a', 'b'], 1, 2)
})

test('can check parent property', t => {
  class Foo {
    foo = 'foo'
  }
  class Boo extends Foo {
    boo = 'boo'
  }
  const boo = new Boo()
  t.is(new Satisfier({ foo: 'foo' }).exec(boo), null)
})

test('actual of type any should not have type checking error', t => {
  let actual: any = { a: 1 }
  t.is(new Satisfier({ a: 1 }).exec(actual), null)
})

test('expect array in hash', t => {
  t.is(new Satisfier({ a: [1, true, 'a'] }).exec({ a: [1, true, 'a'] }), null)
})

test('failing array in hash', t => {
  // console.log(Object.keys(['a', 'b', 'c']))
  const actual = new Satisfier({ a: [1, true, 'a'] }).exec({ a: [1, true, 'b'] })!
  t.is(actual.length, 1)
  assertExec(t, actual[0], ['a', '[2]'], 'a', 'b')
})
