import { primitivePlugin } from './primitivePlugin';

test('support primitive', () => {
  expect(primitivePlugin.support(undefined)).toBe(true)
  expect(primitivePlugin.support(null)).toBe(true)
  expect(primitivePlugin.support(true)).toBe(true)
  expect(primitivePlugin.support(false)).toBe(true)
  expect(primitivePlugin.support(-1)).toBe(true)
  expect(primitivePlugin.support(0)).toBe(true)
  expect(primitivePlugin.support(1)).toBe(true)
  expect(primitivePlugin.support('')).toBe(true)
  expect(primitivePlugin.support('abc')).toBe(true)
})

test('support symbol even it is not es5', () => {
  expect(primitivePlugin.support(Symbol())).toBe(true)
})
