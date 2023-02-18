import { getCallerRelativePath } from './caller.js'

it('get caller file path', () => {
	const fn = () => getCallerRelativePath(fn)
	const actual = fn()
	expect(actual).toMatch('ts/utils/getCallerRelativePath.spec.browser')
})
