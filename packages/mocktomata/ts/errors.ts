import { MocktomataError } from '@mocktomata/framework'
import { ModuleError } from 'iso-error'
export class CannotConfigAfterUsed extends MocktomataError {
  constructor(options?: ModuleError.Options) {
    super(`config() can only be called before usage.`, options)
  }
}
