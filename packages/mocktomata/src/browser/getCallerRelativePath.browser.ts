import { getCallerRelativePath } from './getCallerRelativePath'

it('get caller file path', () => {
  const fn = () => getCallerRelativePath(fn)
  const actual = fn()
  expect(actual).toMatch(/getCallerRelativePath/)
})
