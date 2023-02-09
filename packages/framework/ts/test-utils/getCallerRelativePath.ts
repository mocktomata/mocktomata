import StackUtils from 'stack-utils'
import type { AnyFunction } from 'type-plus'
import { MocktomataError } from '../errors.js'

const stackUtil = new StackUtils({ cwd: process.cwd() })

export function getCallSites() {
	return stackUtil.capture().slice(1)
}

export function getCallerRelativePath(subject: AnyFunction): string {
	const callsite = stackUtil.at(subject)
	const raw = callsite.file || callsite.evalOrigin
	if (!raw) {
		throw new MocktomataError(`Unable to get relative path of the test from '${subject.name}'.
	It should be a function you called directly in the test.`)
	}

	return tryGetPathnameFromUrl(raw) || raw
}

function tryGetPathnameFromUrl(raw: string) {
	try {
		return new URL(raw).pathname
		// istanbul ignore next
	} catch (cause: any) {
		if (raw) return raw
		throw new MocktomataError(
			`Unable to extract relative path from ${raw}.
	This is an unexpected case.

	Please open a ticket in https://github.com/mocktomata/mocktomata/issues`,
			{ cause }
		)
	}
}
