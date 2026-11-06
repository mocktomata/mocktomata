import type { ModuleError } from 'iso-error'
import { tersify } from 'tersify'
import { MocktomataError } from '../errors.js'
import type { SpecRecord } from '../spec_record/types.js'
import { prettifyAction } from './action.format.js'
import type { ArgumentMismatchDetail } from './action.js'
import type { Recorder } from './types.internal.js'

export class SpecIDCannotBeEmpty extends MocktomataError {
	constructor(options?: ModuleError.Options) {
		super('The spec id cannot be an empty string. It should uniquely identify the spec.', options)
	}
}

export class SpecNotFound extends MocktomataError {
	constructor(
		public specName: string,
		public specRelativePath: string,
		options?: ModuleError.Options
	) {
		super(`Unable to find the spec record for ${specRelativePath}: '${specName}'`, options)
	}
}

export class NotSpecable extends MocktomataError {
	constructor(
		public subject: any,
		options?: ModuleError.Options
	) {
		super(`The subject ${tersify(subject, { maxLength: 50 })} is not supported by any loaded plugins`, options)
	}
}

export class ExtraReference extends MocktomataError {
	constructor(
		public specName: string,
		public subject: any,
		options?: ModuleError.Options
	) {
		super(
			`Recorded data for '${specName}' does not expect a new reference to be created: ${tersify(subject, {
				maxLength: 50
			})}`,
			options
		)
	}
}

export type MismatchActionModel = Partial<SpecRecord.Action> & {
	plugin?: string
}

export class ExtraAction extends MocktomataError {
	constructor(
		public specName: string,
		public state: Recorder.State,
		public actionId: number,
		public action: SpecRecord.Action,
		options?: ModuleError.Options
	) {
		super(
			`Recorded data for '${specName}' does not expect action ${actionId}: ${prettifyAction(state, actionId, action)}`,
			options
		)
	}
}

// istanbul ignore next this is not used at the moment
export class MissingAction extends MocktomataError {
	constructor(
		public specName: string,
		public state: prettifyAction.State,
		public actionId: number,
		public action: SpecRecord.Action,
		options?: ModuleError.Options
	) {
		super(
			`Recorded data for '${specName}' expecting action:
  ${prettifyAction(state, actionId, action)}`,
			options
		)
	}
}

export namespace ActionMismatch {
	export type Options = ModuleError.Options & {
		/**
		 * Describes the argument that does not match, when the action is otherwise the expected one.
		 */
		argument?: ArgumentMismatchDetail
	}
}

export class ActionMismatch extends MocktomataError {
	/**
	 * Describes the argument that does not match, when the action is otherwise the expected one.
	 * Strings in it are masked with the `maskValue()` criteria of the run.
	 */
	public argument: ArgumentMismatchDetail | undefined
	constructor(
		public specName: string,
		public actual: MismatchActionModel | undefined,
		public expected: MismatchActionModel | undefined,
		options?: ActionMismatch.Options
	) {
		const { argument, ...errorOptions } = options ?? {}
		super(
			`Recorded data for '${specName}' doesn't match with simulation.
Expecting action:
${tersifyAction(expected)}
Received:
${tersifyAction(actual)}${argument ? `\n${describeArgumentMismatch(argument)}` : ''}`,
			errorOptions
		)
		this.argument = argument
	}
}

// The strings are masked before they reach here, so they are safe to print.
function describeArgumentMismatch({ argumentMatching, index, strings }: ArgumentMismatchDetail) {
	const lines = [`Argument ${index} does not match the record (argumentMatching: '${argumentMatching}').`]
	if (strings) {
		lines.push(`  expected: ${JSON.stringify(strings.expected)}`, `  received: ${JSON.stringify(strings.received)}`)
	}
	lines.push(
		'To accept a value that changes between runs, pass it to spec.ignoreMismatch() and save the spec again.',
		'A string can also be masked with spec.maskValue().'
	)
	return lines.join('\n')
}

export class NoSupportedPlugin extends MocktomataError {
	// istanbul ignore next
	constructor(
		public subject: any,
		options?: ModuleError.Options
	) {
		super(`Unable to find plugin that supports ${tersify(subject)}`, options)
	}
}

export class PluginsNotLoaded extends MocktomataError {
	constructor(
		public specName: string,
		public plugins: string[],
		options?: ModuleError.Options
	) {
		super(`The following plugins are used in spec '${specName}' but not loaded:\n  ${plugins.join('\n  ')}`, options)
	}
}

export class InvokeMetaMethodAfterSpec extends MocktomataError {
	constructor(
		public method: string,
		options?: ModuleError.Options
	) {
		super(`Cannot call 'spec.${method}()' after creating spec subject. Please make these call before that.`, options)
	}
}

function tersifyAction(action: MismatchActionModel | undefined): string {
	return tersify(action, { maxLength: Number.POSITIVE_INFINITY })
}
