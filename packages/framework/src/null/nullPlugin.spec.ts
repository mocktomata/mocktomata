import { nullPlugin } from './nullPlugin';

test('support null', () => {
  expect(nullPlugin.support(null)).toBe(true)
})
