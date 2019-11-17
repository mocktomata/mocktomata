import { tersify } from 'tersify';
import { MocktomataError } from '../errors';
import { SpecReference, SpecAction } from './types';
import { prettifyAction } from './prettifyAction';
import { Recorder } from './recorder';

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

export class PluginNotFound extends MocktomataError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`Could not locate plugin '${pluginName}'`)
  }
}

export class DuplicatePlugin extends MocktomataError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`A plugin with the name '${pluginName}' has already been loaded.`)
  }
}

export class NoActivate extends MocktomataError {
  // istanbul ignore next
  constructor(public moduleName: string) {
    super(`${moduleName} does not export an 'activate()' function`)
  }
}

export class PluginNotConforming extends MocktomataError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`${pluginName} is not a plugin.`)
  }
}

export class ReferenceMismatch extends MocktomataError {
  // istanbul ignore next
  constructor(public specName: string, public actual: Partial<SpecReference>, public expected: Partial<SpecReference> | undefined) {
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

export type MismatchActionModel = Partial<SpecAction> & { plugin?: string }

export class ExtraAction extends MocktomataError {
  constructor(public specName: string, state: Pick<Recorder.State, 'id' | 'plugin'>, public actionId: number, public action: SpecAction) {
    super(`Recorded data for '${specName}' does not expect ${prettifyAction(state, actionId, action)}`)
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

function tersifyAction(action: MismatchActionModel | undefined): string {
  if (!action) return 'none'

  return tersify(action, { maxLength: Infinity })
}

function tersifyReference(reference: Partial<SpecReference> | undefined): string {
  if (!reference) return 'none'

  return tersify(reference, { maxLength: Infinity })
}
