import { a } from 'assertron'
import { filename } from 'dirname-filename-esm'
import path from 'path'
import { getCallerRelativePath } from './getCallerRelativePath.js'

it('get caller file path', () => {
	const fn = () => getCallerRelativePath(fn)
	const actual = fn()
	const expected = path.relative(process.cwd(), filename(import.meta))
	a.pathEqual(actual, expected)
})

it('throws when subject is not in call path', () => {
	function foo() {}
	const err = a.throws(() => getCallerRelativePath(foo))
	expect(err.message).toEqual(`Unable to get relative path of the test from 'foo'.
	It should be a function you called directly in the test.`)
})
