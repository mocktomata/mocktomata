import { tersify } from 'tersify'
import { MocktomataError } from '../errors'
import { prettifyAction } from './prettifyAction'
import { SpecRecord } from './types'
import { Recorder } from './types-internal'

export class SpecIDCannotBeEmpty extends MocktomataError {
  // istanbul ignore next
  constructor() {
    super(`The spec id cannot be an empty string. It should uniquely identify the spec.`)
  }
}

export class SpecNotFound extends MocktomataError {
  // istanbul ignore next
  constructor(public specName: string, public reason?: Error) {
    super(`Unable to find the spec record for '${specName}'${reason ? `due to: ${reason}` : ''}`)
  }
}

export class NotSpecable extends MocktomataError {
  // istanbul ignore next
  constructor(public subject: any) {
    super(`The ${typeof subject === 'string' ? subject : `subject ${tersify(subject, { maxLength: 50 })}`} is not supported by any loaded plugins`)
  }
}

export class ReferenceMismatch extends MocktomataError {
  // istanbul ignore next
  constructor(public specName: string, public actual: Partial<SpecRecord.Reference>, public expected: Partial<SpecRecord.Reference> | undefined) {
    super(`Recorded data for '${specName}' doesn't match with simulation.
Expecting reference:
${tersifyReference(expected)}
Received:
${tersifyReference(actual)}`)
  }
}

export class ExtraReference extends MocktomataError {
  // istanbul ignore next
  constructor(public specName: string, public subject: any) {
    super(`Recorded data for '${specName}' does not expect a new reference to be created: ${tersify(subject, { maxLength: 50 })}`)
  }
}

export class ExtraInstance extends MocktomataError {
  // istanbul ignore next
  constructor(public specName: string, public plugin: string) {
    super(`Recorded data for '${specName}' does not expect a new reference to be created for plugin: ${plugin}`)
  }
}

export type MismatchActionModel = Partial<SpecRecord.Action> & { plugin?: string }

export class ExtraAction extends MocktomataError {
  constructor(public specName: string, public state: Recorder.State, public actionId: number, public action: SpecRecord.Action) {
    super(`Recorded data for '${specName}' does not expect action ${actionId}: ${prettifyAction(state, actionId, action)}`)
  }
}

export class MissingAction extends MocktomataError {
  constructor(public specName: string, public state: Pick<Recorder.State, 'ref' | 'refId' | 'source'>, public actionId: number, public action: SpecRecord.Action) {
    super(`Recorded data for '${specName}' expecting action:
  ${prettifyAction(state, actionId, action)}`)
  }
}

export class MissingResultAction extends MocktomataError {
  constructor(public specName: string, state: Recorder.State, public actionId: number, public action: SpecRecord.Action) {
    super(`Recorded data for '${specName}' expecting action:
  ${prettifyAction(state, actionId, action)}
Did you forget to wait for the result?`)
  }
}

export class ActionTypeMismatch extends MocktomataError {
  constructor(public specName: string, state: Recorder.State, public actionId: number, public action: SpecRecord.Action, public receivedType: string) {
    super(`Recorded data for '${specName}' expecting ${prettifyAction(state, actionId, action)} but received a ${receivedType} action`)
  }
}

export class ActionMismatch extends MocktomataError {
  constructor(public specName: string, public actual: MismatchActionModel | undefined, public expected: MismatchActionModel | undefined) {
    super(`Recorded data for '${specName}' doesn't match with simulation.
Expecting action:
${tersifyAction(expected)}
Received:
${tersifyAction(actual)}`)
  }
}

export class NoSupportedPlugin extends MocktomataError {
  constructor(public subject: any) {
    super(`Unable to find plugin that supports ${tersify(subject)}`)
  }
}

export class PluginsNotLoaded extends MocktomataError {
  constructor(public specName: string, public plugins: string[]) {
    super(`The following plugins are usec in spec '${specName}' but not loaded:\n  ${plugins.join('\n  ')}`)
  }
}

function tersifyAction(action: MismatchActionModel | undefined): string {
  if (!action) return 'none'

  return tersify(action, { maxLength: Infinity })
}

function tersifyReference(reference: Partial<SpecRecord.Reference> | undefined): string {
  if (!reference) return 'none'

  return tersify(reference, { maxLength: Infinity })
}
