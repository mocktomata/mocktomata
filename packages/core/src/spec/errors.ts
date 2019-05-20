import { logLevel } from '@unional/logging';
import { tersify } from 'tersify';
import { log, KomondorError } from '../common';
import { SpecAction } from './types';

export class IDCannotBeEmpty extends KomondorError {
  // istanbul ignore next
  constructor() {
    super(`The spec id cannot be an empty string. It should uniquely identify the spec.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class SpecNotFound extends KomondorError {
  // istanbul ignore next
  constructor(public specId: string, public reason?: Error) {
    super(`Unable to find the spec record for '${specId}'${reason ? `due to: ${reason}` : ''}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NotSpecable extends KomondorError {
  // istanbul ignore next
  constructor(public subject: any) {
    super(`The ${typeof subject === 'string' ? subject : `subject ${tersify(subject, { maxLength: 50 })}`} is not supported by any loaded plugins`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class SimulationMismatch extends KomondorError {
  // istanbul ignore next
  constructor(public specId: string, public expected: Pick<SpecAction, 'type'>, public actual?: Pick<SpecAction, 'type'>) {
    super(`Recorded data for '${specId}' doesn't match with simulation. Expecting ${tersifyAction(expected)} but received ${tersifyAction(actual)}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

function tersifyAction(action: Pick<SpecAction, 'type'> | undefined): string {
  if (!action) return 'none'

  if (log.level >= logLevel.debug) {
    return tersify(action, { maxLength: Infinity })
  }
  else {
    return `${['a', 'e', 'i', 'o', 'u'].some(x => action.type.startsWith(x)) ? 'an' : 'a'} ${action.type} action`
  }
}
