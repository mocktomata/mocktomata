import { a } from 'assertron'
import { filename } from 'dirname-filename-esm'
import path from 'path'
import { createStackFrameContext } from './stack_frame.js'

// `jsdom` error file path is using absolute path.
// the `process.cwd()` is the one it will be using.
const { stackFrame } = createStackFrameContext({
	cwd: process.cwd(),
	url: location.origin
})

it('get caller file path', () => {
	const fn = () => stackFrame.getCallerRelativePath()
	const actual = fn()
	const expected = path.relative(process.cwd(), filename(import.meta))
	a.pathEqual(actual, expected)
})
