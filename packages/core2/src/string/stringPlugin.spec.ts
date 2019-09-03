import { stringPlugin } from './stringPlugin';

test('support string', () => {
  expect(stringPlugin.support('')).toBe(true)
  expect(stringPlugin.support(' ')).toBe(true)
  expect(stringPlugin.support(`abc`)).toBe(true)
})
