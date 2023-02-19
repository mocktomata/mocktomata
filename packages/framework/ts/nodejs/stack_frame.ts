import StackUtils from 'stack-utils'
import type { AnyFunction } from 'type-plus'
import { MocktomataError } from '../errors.js'
import type { StackFrameContext } from '../stack_frame.js'

export function createStackFrameContext(base: string): StackFrameContext {
	const stackUtil = new StackUtils({ cwd: base })
	return {
		stackFrame: {
			getCallSites(skipFrames = 0) {
				return stackUtil
					.capture()
					.slice(skipFrames + 1)
					.map(c => c.toString())
				// return esp
				// 	.parse(new Error())
				// 	.slice(skipFrames + 1)
				// 	.map(s => `${relative(base, s.fileName!)}:${s.columnNumber} (${s.functionName})`)
			},
			getCallerRelativePath(subject: AnyFunction) {
				Error.captureStackTrace
				const callsite = stackUtil.at(subject)
				const raw = callsite.file || callsite.evalOrigin
				if (!raw) {
					throw new MocktomataError(`Unable to get relative path of the test from '${subject.name}'.
It should be a function you called directly in the test.`)
				}

				return tryGetPathnameFromUrl(raw)
				// 				const stackFrames = esp.parse(new Error())
				// 				const subjectIndex = stackFrames.findIndex(
				// 					s => s.functionName === subject.name || s.functionName?.startsWith(`Function.${subject.name}`)
				// 				)
				// 				if (subjectIndex === -1) {
				// 					console.log(subject.name, new Error().stack)
				// 					throw new MocktomataError(`Unable to get relative path of the test from '${subject.name}'.
				// It should be a function you called directly in the test.`)
				// 				}
				// 				const callsite = stackFrames[subjectIndex + 1]!
				// 				const filename = callsite.fileName || callsite.evalOrigin?.fileName
				// 				if (!filename) {
				// 					throw new MocktomataError(`Unable to get relative path of the test from '${subject.name}'.
				// It should be a function you called directly in the test.`)
				// 				}
				// 				return relative(base, filename)
			}
		}
	}
}

function tryGetPathnameFromUrl(raw: string) {
	try {
		return new URL(raw).pathname
	} catch (cause: any) {
		if (raw) return raw
		// istanbul ignore next
		throw new MocktomataError(
			`Unable to extract relative path from ${raw}.
	This is an unexpected case.

	Please open a ticket in https://github.com/mocktomata/mocktomata/issues`,
			{ cause }
		)
	}
}
