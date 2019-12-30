import { MocktomataError } from '@mocktomata/framework';

export class CannotConfigAfterUsed extends MocktomataError {
  constructor() {
    super(`config() can only be called before usage.`)
  }
}
