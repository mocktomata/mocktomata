import { ModuleError } from 'iso-error'

export class MocktomataError extends ModuleError {
  constructor(description: string) {
    super('mocktomata', description)
  }
}
