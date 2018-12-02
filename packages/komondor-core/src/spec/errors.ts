import { BaseError } from 'make-error'
import { tersify } from 'tersify';
import { SpecAction } from './interfaces';

export class IDCannotBeEmpty extends BaseError {
  // istanbul ignore next
  constructor() {
    super(`The spec id cannot be an empty string. It should uniquely identify the spec.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NotSpecable extends BaseError {
  // istanbul ignore next
  constructor(public subject: any) {
    super(`The ${typeof subject === 'string' ? subject : `subject ${tersify(subject, { maxLength: 50 })}`} is not supported by any loaded plugins`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class SimulationMismatch extends BaseError {
  // istanbul ignore next
  constructor(public specId: string, public expected: Partial<SpecAction>, public actual?: Partial<SpecAction>) {
    super(`Recorded data for '${specId}' doesn't match with simulation. Expecting ${tersify(expected, { maxLength: Infinity })} but received ${tersify(actual, { maxLength: Infinity })}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
