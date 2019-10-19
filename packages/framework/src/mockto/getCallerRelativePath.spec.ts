import { getCallerRelativePath } from './getCallerRelativePath'
import path from 'path'

test('get caller file path', () => {
  const fn = () => getCallerRelativePath(fn)
  const actual = fn()
  const expected = path.relative(process.cwd(), __filename)
  expect(actual).toEqual(expected)
})
