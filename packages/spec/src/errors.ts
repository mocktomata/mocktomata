import { logLevel } from '@unional/logging';
import { ModuleError } from 'iso-error';
import { tersify } from 'tersify';
import { SpecContext } from './context';
import { log } from './log';
import { SpecAction } from './spec/types';

export class SpecError extends ModuleError {
  constructor(description: string, ...errors: Error[]) {
    super('komondor-spec', description, ...errors)
  }
}

export class IDCannotBeEmpty extends SpecError {
  // istanbul ignore next
  constructor() {
    super(`The spec id cannot be an empty string. It should uniquely identify the spec.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class SpecNotFound extends SpecError {
  // istanbul ignore next
  constructor(public specId: string, public reason?: Error) {
    super(`Unable to find the spec record for '${specId}'${reason ? `due to: ${reason}` : ''}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NotSpecable extends SpecError {
  // istanbul ignore next
  constructor(public subject: any) {
    super(`The ${typeof subject === 'string' ? subject : `subject ${tersify(subject, { maxLength: 50 })}`} is not supported by any loaded plugins`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class SimulationMismatch extends SpecError {
  // istanbul ignore next
  constructor(public specId: string, public expected: SpecAction, public actual?: SpecAction) {
    super(`Recorded data for '${specId}' doesn't match with simulation. Expecting ${tersifyAction(expected)} but received ${tersifyAction(actual)}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

function tersifyAction(action?: SpecAction): string {
  if (!action) return 'none'

  if (log.level >= logLevel.debug) {
    return tersify(action, { maxLength: Infinity })
  }
  else {
    return `${['a', 'e', 'i', 'o', 'u'].some(x => action.name.startsWith(x)) ? 'an' : 'a'} ${action.name} action`
  }
}

export class MissingArtifact extends SpecError {
  // istanbul ignore next
  constructor(id: string) {
    super(`Missing artifact: ${id}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class PluginNotFound extends SpecError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`Could not locate plugin '${pluginName}'`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class DuplicatePlugin extends SpecError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`A plugin with the name '${pluginName}' has already been loaded.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NoActivate extends SpecError {
  constructor(public moduleName: string) {
    super(`${moduleName} does not export an 'activate()' function`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class PluginNotConforming extends SpecError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`${pluginName} is not a plugin.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
