import esp from 'error-stack-parser'
import path from 'pathe'
import type { StackFrameContext } from './stack_frame.types.js'

export function createStackFrameContext(base: string): StackFrameContext {
	return {
		stackFrame: {
			getCallerRelativePath() {
				const frame = esp.parse(new Error())[2]
				const value = stripPath(frame!.fileName!, base)
				// for browser, `value` might contains query param, in the form of
				// ts/stories/Counter.stories.tsx?t=1677570975497
				// since filepath does not support `?`,
				// this can be used for both cases.
				return value.split('?')[0]
			}
		}
	}
}

const rePathSeparatorLeftTrim = new RegExp(`^${path.sep}+`)

function stripPath(path_: string, stripPath: string) {
	if (!stripPath || stripPath.length === 0) {
		return path_
	}

	path_ = path.normalize(path_)
	stripPath = path.normalize(stripPath)
	const pos = path_.indexOf(stripPath)
	path_ = pos === -1 ? path_ : path_.slice(pos + stripPath.length, path_.length)
	path_ = path_.replace(rePathSeparatorLeftTrim, '')

	return path_
}
