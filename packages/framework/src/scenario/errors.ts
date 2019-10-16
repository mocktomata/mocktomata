import { KomondorError } from '../errors';

export class ScenarioNotFound extends KomondorError {
  constructor(id: string) {
    super(`Cannot find scenario '${id}'`)
  }
}
