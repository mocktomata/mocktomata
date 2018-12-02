import { BaseError } from 'make-error'
import { tersify } from 'tersify'

import { SpecAction } from './interfaces'

export class SimulationMismatch extends BaseError {
  // istanbul ignore next
  constructor(public specId: string, public expected: Partial<SpecAction>, public actual?: Partial<SpecAction>) {
    super(`Recorded data for '${specId}' doesn't match with simulation. Expecting ${tersify(expected, { maxLength: Infinity })} but received ${tersify(actual, { maxLength: Infinity })}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
