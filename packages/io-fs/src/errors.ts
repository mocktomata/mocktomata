import { BaseError } from 'make-error';

export class SpecNotFound extends BaseError {
  // istanbul ignore next
  constructor(public specId: string, public reason?: Error) {
    super(`Unable to find the spec record for '${specId}'${reason ? `due to: ${reason}` : ''}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class ScenarioNotFound extends BaseError {
  // istanbul ignore next
  constructor(id: string) {
    super(`Cannot find scenario '${id}'`)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
