import { BaseError } from 'make-error';

export class SpecNotFound extends BaseError {
  // istanbul ignore next
  constructor(id: string) {
    super(`Cannot find spec '${id}'`)
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
