import { MocktomataError } from '../errors';

export class ScenarioNotFound extends MocktomataError {
  constructor(id: string) {
    super(`Cannot find scenario '${id}'`)
  }
}
