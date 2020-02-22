import { ModuleError } from 'iso-error'

export class MocktomataError extends ModuleError {
  constructor(description: string, ...errors: Error[]) {
    super('mocktomata', description, ...errors)
  }
}
