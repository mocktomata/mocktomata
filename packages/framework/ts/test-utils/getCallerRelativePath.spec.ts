import a from 'assertron'
import { filename } from 'dirname-filename-esm'
import path from 'path'
import { getCallerRelativePath } from './getCallerRelativePath.js'

test('get caller file path', () => {
	const fn = () => getCallerRelativePath(fn)
	const actual = fn()
	const expected = path.relative(process.cwd(), filename(import.meta))
	a.pathEqual(actual, expected)
})
