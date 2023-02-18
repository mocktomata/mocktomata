import { genFilename } from './filename.js'

it('accepts empty string as id', () => {
	const actual = genFilename('baseDir', '')
	expect(actual).toEqual('empty')
})

it('accepts unique code', () => {
	const actual = genFilename('baseDir', '中文')
	expect(actual).toEqual('中文')
})

it('convert space to _', () => {
	const actual = genFilename('baseDir', 'a b')
	expect(actual).toEqual('a-b')
})

it('trims the string when it is too long', () => {
	const actual = genFilename(
		'baseDir',
		'this is a somewhat long description of a test. which is okey up to this point, but when it gets longer than around here, it is too long to deal with'
	)
	expect(actual).toEqual('this-is-a-somewhat-long-description-of-a-test.-which-is-okey-up-to-this-point...')
})

it('adds dupId to the end', () => {
	const actual = genFilename('baseDir', 'something', 2)
	expect(actual).toEqual('something2')
})

it('truncates more with long baseDir', () => {
	const actual = genFilename(longBase230, 'this is a somewhat long description of a test')
	expect(actual).toEqual('this-is...')
})

it('truncates with dupId', () => {
	const actual = genFilename(longBase230, 'this is a somewhat long description of a test', 12)
	expect(actual).toEqual('thi...12')
})

const longBase230 =
	'12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
