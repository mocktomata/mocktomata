import { BaseError } from 'make-error'

export class ScenarioNotFound extends BaseError {
  // istanbul ignore next
  constructor(id: string) {
    super(`Cannot find scenario '${id}'`)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
