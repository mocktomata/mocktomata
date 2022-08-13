import { functionPlugin } from '../function/index.js';
import { Dummy } from '../test-artifacts/index.js';

test('do not supports primitive types other than functions', () => {
  expect(functionPlugin.support(undefined)).toBe(false)
  expect(functionPlugin.support(null)).toBe(false)
  expect(functionPlugin.support(0)).toBe(false)
  expect(functionPlugin.support(true)).toBe(false)
  expect(functionPlugin.support('a')).toBe(false)
  expect(functionPlugin.support(Symbol())).toBe(false)
  expect(functionPlugin.support({})).toBe(false)
  expect(functionPlugin.support([])).toBe(false)
})

test('support simple function', () => {
  expect(functionPlugin.support(function foo() { return })).toBeTruthy()
  expect(functionPlugin.support(function () { return })).toBeTruthy()
})

test('support arrow function', () => {
  expect(functionPlugin.support(() => false)).toBeTruthy()
})

test('not support class', () => {
  expect(functionPlugin.support(Dummy)).toBeFalsy()
})
