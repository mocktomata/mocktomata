import { ModuleError } from 'iso-error'
import { tersify } from 'tersify'
import { MocktomataError } from '../errors.js'
import type { SpecRecord } from '../spec-record/types.js'
import { prettifyAction } from './prettifyAction.js'
import type { Recorder } from './types.internal.js'

export class SpecIDCannotBeEmpty extends MocktomataError {
	constructor(options?: ModuleError.Options) {
		super(`The spec id cannot be an empty string. It should uniquely identify the spec.`, options)
	}
}

export class SpecNotFound extends MocktomataError {
	constructor(public specName: string, public specRelativePath: string, options?: ModuleError.Options) {
		super(`Unable to find the spec record for ${specRelativePath}: '${specName}'`, options)
	}
}

export class NotSpecable extends MocktomataError {
	constructor(public subject: any, options?: ModuleError.Options) {
		super(
			`The subject ${tersify(subject, { maxLength: 50 })} is not supported by any loaded plugins`,
			options
		)
	}
}

export class ExtraReference extends MocktomataError {
	constructor(public specName: string, public subject: any, options?: ModuleError.Options) {
		super(
			`Recorded data for '${specName}' does not expect a new reference to be created: ${tersify(subject, {
				maxLength: 50
			})}`,
			options
		)
	}
}

export type MismatchActionModel = Partial<SpecRecord.Action> & { plugin?: string }

export class ExtraAction extends MocktomataError {
	constructor(
		public specName: string,
		public state: Recorder.State,
		public actionId: number,
		public action: SpecRecord.Action,
		options?: ModuleError.Options
	) {
		super(
			`Recorded data for '${specName}' does not expect action ${actionId}: ${prettifyAction(
				state,
				actionId,
				action
			)}`,
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

export class ActionMismatch extends MocktomataError {
	constructor(
		public specName: string,
		public actual: MismatchActionModel | undefined,
		public expected: MismatchActionModel | undefined,
		options?: ModuleError.Options
	) {
		super(
			`Recorded data for '${specName}' doesn't match with simulation.
Expecting action:
${tersifyAction(expected)}
Received:
${tersifyAction(actual)}`,
			options
		)
	}
}

export class NoSupportedPlugin extends MocktomataError {
	// istanbul ignore next
	constructor(public subject: any, options?: ModuleError.Options) {
		super(`Unable to find plugin that supports ${tersify(subject)}`, options)
	}
}

export class PluginsNotLoaded extends MocktomataError {
	constructor(public specName: string, public plugins: string[], options?: ModuleError.Options) {
		super(
			`The following plugins are used in spec '${specName}' but not loaded:\n  ${plugins.join('\n  ')}`,
			options
		)
	}
}

export class InvokeMetaMethodAfterSpec extends MocktomataError {
	constructor(public method: string, options?: ModuleError.Options) {
		super(
			`Cannot call 'spec.${method}()' after creating spec subject. Please make these call before that.`,
			options
		)
	}
}

function tersifyAction(action: MismatchActionModel | undefined): string {
	return tersify(action, { maxLength: Infinity })
}
