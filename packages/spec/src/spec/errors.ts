import { ModuleError } from 'iso-error';
import { tersify } from 'tersify';
import { SpecAction } from './types';

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
  constructor(public specId: string, public expected: Partial<SpecAction>, public actual?: Partial<SpecAction>) {
    super(`Recorded data for '${specId}' doesn't match with simulation. Expecting ${tersify(expected, { maxLength: Infinity })} but received ${tersify(actual, { maxLength: Infinity })}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class MissingArtifact extends SpecError {
  // istanbul ignore next
  constructor(id: string) {
    super(`Missing artifact: ${id}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
