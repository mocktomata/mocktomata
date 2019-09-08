import { logLevel, shouldLog } from 'standard-log';
import { tersify } from 'tersify';
import { KomondorError } from '../errors';
import { log } from '../log';
import { SpecReference } from './types';

export class SpecIDCannotBeEmpty extends KomondorError {
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

export class PluginNotFound extends KomondorError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`Could not locate plugin '${pluginName}'`)
  }
}

export class DuplicatePlugin extends KomondorError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`A plugin with the name '${pluginName}' has already been loaded.`)
  }
}

export class NoActivate extends KomondorError {
  // istanbul ignore next
  constructor(public moduleName: string) {
    super(`${moduleName} does not export an 'activate()' function`)
  }
}

export class PluginNotConforming extends KomondorError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`${pluginName} is not a plugin.`)
  }
}

export class ReferenceMismatch extends KomondorError {
  // istanbul ignore next
  constructor(public specId: string, public actual: Pick<SpecReference, 'plugin'>, public expected: Pick<SpecReference, 'plugin'> | undefined) {
    super(`Recorded data for '${specId}' doesn't match with simulation.
Expecting reference:
${tersifyReference(expected)}
Received:
${tersifyReference(actual)}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export type MismatchActionModel = { type: string, plugin?: string }

export class ActionMismatch extends KomondorError {
  // istanbul ignore next
  constructor(public specId: string, public actual: MismatchActionModel | undefined, public expected: MismatchActionModel | undefined) {
    super(`Recorded data for '${specId}' doesn't match with simulation.
Expecting action:
${tersifyAction(expected)}
Received:
${tersifyAction(actual)}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

function tersifyAction(action: MismatchActionModel | undefined): string {
  if (!action) return 'none'

  if (shouldLog(logLevel.debug, log.level)) {
    return tersify(action, { maxLength: Infinity })
  }
  else {
    const name = action.plugin ? `${action.plugin} ${action.type}` : action.type
    return `${['a', 'e', 'i', 'o', 'u'].some(x => name.startsWith(x)) ? 'an' : 'a'} ${name} action`
  }
}

function tersifyReference(reference: Pick<SpecReference, 'plugin'> | undefined): string {
  if (!reference) return 'none'

  if (shouldLog(logLevel.debug, log.level)) {
    return tersify(reference, { maxLength: Infinity })
  }
  else {
    return `${['a', 'e', 'i', 'o', 'u'].some(x => reference.plugin.startsWith(x)) ? 'an' : 'a'} ${reference.plugin} reference`
  }
}
