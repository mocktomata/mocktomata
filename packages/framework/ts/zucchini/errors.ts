import { ModuleError } from 'iso-error'
import { AnyFunction } from 'type-plus'
import { MocktomataError } from '../errors.js'

export class DuplicateStep extends MocktomataError {
	constructor(
		public clause: string | RegExp,
		handler1: AnyFunction,
		handler2: AnyFunction,
		options?: ModuleError.Options
	) {
		super(
			`Step ${clauseToString(clause)} already defined:
handler1:
${handler1.toString()}

handler2:
${handler2.toString()}`,
			options
		)
	}
}

export class MissingStep extends MocktomataError {
	constructor(public clause: string | RegExp, options?: ModuleError.Options) {
		super(`Step ${clauseToString(clause)} is not defined`, options)
	}
}

function clauseToString(clause: string | RegExp) {
	if (clause instanceof RegExp) return clause
	return `'${clause}'`
}
