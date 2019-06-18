import { KomondorError } from '../errors';

export class ScenarioNotFound extends KomondorError {
  // istanbul ignore next
  constructor(id: string) {
    super(`Cannot find scenario '${id}'`)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
