import { a } from 'assertron'
import { filename } from 'dirname-filename-esm'
import path from 'path'
import { createStackFrameContext } from './stack_frame.js'

const { stackFrame } = createStackFrameContext({
	cwd: process.cwd()
})

it('get caller file path', () => {
	const fn = () => stackFrame.getCallerRelativePath()
	const actual = fn()
	const expected = path.relative(process.cwd(), filename(import.meta))
	a.pathEqual(actual, expected)
})
