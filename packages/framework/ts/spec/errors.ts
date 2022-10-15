import { tersify } from 'tersify'
import { MocktomataError } from '../errors.js'
import type { SpecRecord } from '../spec-record/types.js'
import { prettifyAction } from './prettifyAction.js'
import type { Recorder } from './types.internal.js'

export class SpecIDCannotBeEmpty extends MocktomataError {
  constructor() {
    super(`The spec id cannot be an empty string. It should uniquely identify the spec.`)
  }
}

export class SpecNotFound extends MocktomataError {
  constructor(public specName: string, public specRelativePath: string) {
    super(`Unable to find the spec record for ${specRelativePath}: '${specName}'`)
  }
}

export class NotSpecable extends MocktomataError {
  constructor(public subject: any) {
    super(`The subject ${tersify(subject, { maxLength: 50 })} is not supported by any loaded plugins`)
  }
}

export class ExtraReference extends MocktomataError {
  constructor(public specName: string, public subject: any) {
    super(`Recorded data for '${specName}' does not expect a new reference to be created: ${tersify(subject, { maxLength: 50 })}`)
  }
}

export type MismatchActionModel = Partial<SpecRecord.Action> & { plugin?: string }

export class ExtraAction extends MocktomataError {
  constructor(public specName: string, public state: Recorder.State, public actionId: number, public action: SpecRecord.Action) {
    super(`Recorded data for '${specName}' does not expect action ${actionId}: ${prettifyAction(state, actionId, action)}`)
  }
}

export class MissingAction extends MocktomataError {
  constructor(public specName: string, public state: prettifyAction.State, public actionId: number, public action: SpecRecord.Action) {
    super(`Recorded data for '${specName}' expecting action:
  ${prettifyAction(state, actionId, action)}`)
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
  // istanbul ignore next
  constructor(public subject: any) {
    super(`Unable to find plugin that supports ${tersify(subject)}`)
  }
}

export class PluginsNotLoaded extends MocktomataError {
  constructor(public specName: string, public plugins: string[]) {
    super(`The following plugins are used in spec '${specName}' but not loaded:\n  ${plugins.join('\n  ')}`)
  }
}

export class InvokeMetaMethodAfterSpec extends MocktomataError {
  constructor(public method: string) {
    super(`Cannot call 'spec.${method}()' after creating spec subject. Please make these call before that.`)
  }
}

function tersifyAction(action: MismatchActionModel | undefined): string {
  return tersify(action, { maxLength: Infinity })
}
