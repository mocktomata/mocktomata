import { logLevel, shouldLog } from 'standard-log';
import { tersify } from 'tersify';
import { KomondorError } from '../errors';
import { log } from '../util';

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

export class ReferenceMismatch extends KomondorError {
  // istanbul ignore next
  constructor(public specId: string, public expected: { plugin: string } | undefined, public actual: { plugin: string }) {
    super(`Recorded data for '${specId}' doesn't match with simulation.
Expecting:
${tersifyReference(expected)}
Received:
${tersifyReference(actual)}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class ActionMismatch extends KomondorError {
  // istanbul ignore next
  constructor(public specId: string, public expected: { type: string, plugin: string } | undefined, public actual: { type: string, plugin: string } | undefined) {
    super(`Recorded data for '${specId}' doesn't match with simulation.
Expecting:
${tersifyAction(expected)}
Received:
${tersifyAction(actual)}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

function tersifyAction(action: { type: string, plugin: string } | undefined): string {
  if (!action) return 'none'

  if (shouldLog(logLevel.debug, log.level)) {
    return tersify(action, { maxLength: Infinity })
  }
  else {
    return `${['a', 'e', 'i', 'o', 'u'].some(x => action.plugin.startsWith(x)) ? 'an' : 'a'} ${action.plugin} ${action.type} action`
  }
}


function tersifyReference(reference: { plugin: string } | undefined): string {
  if (!reference) return 'none'

  if (shouldLog(logLevel.debug, log.level)) {
    return tersify(reference, { maxLength: Infinity })
  }
  else {
    return `${['a', 'e', 'i', 'o', 'u'].some(x => reference.plugin.startsWith(x)) ? 'an' : 'a'} ${reference.plugin} reference`
  }
}
