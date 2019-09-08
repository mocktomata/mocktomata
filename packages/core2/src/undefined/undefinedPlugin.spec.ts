import { undefinedPlugin } from './undefinedPlugin';

test('support undefined', () => {
  expect(undefinedPlugin.support(undefined)).toBe(true)
})
